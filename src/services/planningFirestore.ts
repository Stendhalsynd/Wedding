import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Firestore,
  type QuerySnapshot,
  type Unsubscribe,
  type WriteBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  emptyPlanningState,
  planningCollections,
  getPlanningMergeKey,
  planningSeed,
  sortPlanningRecords,
  type ApartmentCandidate,
  type BudgetRow,
  type PlanningState,
  type PolicyCheck,
  type TimelineItem,
  type VendorCategory,
} from './planningData';

const seedVersion = '2026-05-17-happylife';

const createRecordId = (ownerKey: string, seedId: string) => `${ownerKey}_${seedId}`;

const createBaseFields = (ownerKey: string, authorId: string) => ({
  coupleId: ownerKey,
  authorId,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

const toRecords = <T>(snapshot: QuerySnapshot) =>
  snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as T));

export const ensurePlanningSeed = async (
  ownerKey: string,
  authorId: string,
  firestore: Firestore = db,
) => {
  const metadataQuery = query(
    collection(firestore, planningCollections.metadata),
    where('coupleId', '==', ownerKey),
  );
  const metadataSnapshot = await getDocs(metadataQuery);
  if (!metadataSnapshot.empty) return;

  const batch = writeBatch(firestore);
  const base = createBaseFields(ownerKey, authorId);

  for (const row of planningSeed.budgetRows) {
    const id = createRecordId(ownerKey, row.id);
    batch.set(doc(firestore, planningCollections.budgetRows, id), { ...row, id, sourceSeedId: row.id, ...base });
  }
  for (const vendor of planningSeed.vendors) {
    const id = createRecordId(ownerKey, vendor.id);
    batch.set(doc(firestore, planningCollections.vendors, id), { ...vendor, id, sourceSeedId: vendor.id, ...base });
  }
  for (const apartment of planningSeed.apartments) {
    const id = createRecordId(ownerKey, apartment.id);
    batch.set(doc(firestore, planningCollections.apartments, id), { ...apartment, id, sourceSeedId: apartment.id, ...base });
  }
  for (const policy of planningSeed.policies) {
    const id = createRecordId(ownerKey, policy.id);
    batch.set(doc(firestore, planningCollections.policies, id), { ...policy, id, sourceSeedId: policy.id, ...base });
  }
  for (const timelineItem of planningSeed.timeline) {
    const id = createRecordId(ownerKey, timelineItem.id);
    batch.set(doc(firestore, planningCollections.timeline, id), { ...timelineItem, id, sourceSeedId: timelineItem.id, ...base });
  }

  const metadataId = createRecordId(ownerKey, 'metadata');
  batch.set(doc(firestore, planningCollections.metadata, metadataId), {
    id: metadataId,
    coupleId: ownerKey,
    authorId,
    seedVersion,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
};

export const subscribePlanningState = (
  ownerKey: string,
  onChange: (state: PlanningState) => void,
  onError: (error: Error) => void,
  firestore: Firestore = db,
): Unsubscribe => {
  const state: PlanningState = { ...emptyPlanningState };
  const emit = () => onChange({ ...state });
  const subscribe = <T>(
    collectionName: string,
    assign: (records: T[]) => void,
  ) => onSnapshot(
    query(collection(firestore, collectionName), where('coupleId', '==', ownerKey)),
    (snapshot) => {
      assign(sortPlanningRecords(toRecords<T>(snapshot)));
      emit();
    },
    onError,
  );

  const unsubscribes = [
    subscribe<BudgetRow>(planningCollections.budgetRows, (records) => { state.budgetRows = records; }),
    subscribe<VendorCategory>(planningCollections.vendors, (records) => { state.vendors = records; }),
    subscribe<ApartmentCandidate>(planningCollections.apartments, (records) => { state.apartments = records; }),
    subscribe<PolicyCheck>(planningCollections.policies, (records) => { state.policies = records; }),
    subscribe<TimelineItem>(planningCollections.timeline, (records) => { state.timeline = records; }),
  ];

  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
};

export const updatePlanningBudgetActual = (
  rowId: string,
  actual: number,
  firestore: Firestore = db,
) => updateDoc(doc(firestore, planningCollections.budgetRows, rowId), {
  actual,
  updatedAt: serverTimestamp(),
});

export const migratePlanningDocuments = async (
  batch: WriteBatch,
  fromOwnerKeys: string[],
  toCoupleId: string,
  firestore: Firestore = db,
) => {
  const collectionNames = Object.values(planningCollections);

  for (const collectionName of collectionNames) {
    const seenMergeKeys = new Set<string>();

    for (const ownerKey of fromOwnerKeys) {
      const snapshot = await getDocs(query(
        collection(firestore, collectionName),
        where('coupleId', '==', ownerKey),
      ));

      snapshot.forEach((document) => {
        const mergeKey = collectionName === planningCollections.metadata
          ? planningCollections.metadata
          : getPlanningMergeKey({ id: document.id, sourceSeedId: document.data().sourceSeedId });
        if (seenMergeKeys.has(mergeKey)) {
          batch.delete(document.ref);
          return;
        }

        seenMergeKeys.add(mergeKey);
        batch.update(document.ref, {
          coupleId: toCoupleId,
          updatedAt: serverTimestamp(),
        });
      });
    }
  }
};
