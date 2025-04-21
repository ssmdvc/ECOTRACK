import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../src/firebase'

export const addFeedback = async (feedbackData) => {
    try {
      const docRef = await addDoc(collection(db, 'feedbacks'), {
        ...feedbackData,
        date: serverTimestamp(),
        comments: [],
        rating: feedbackData.rating || 0,
      });
      console.log("Feedback added with ID: ", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error adding feedback: ", error);
      throw error;
    }
  };
  
  export const getFeedbacks = async () => {
    try {
      const q = query(collection(db, 'feedbacks'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching feedbacks: ", error);
      throw error;
    }
  };
  
  export const updateFeedback = async (id, updatedData) => {
    try {
      const feedbackRef = doc(db, 'feedbacks', id);
      await updateDoc(feedbackRef, updatedData);
      console.log("Feedback updated successfully");
    } catch (error) {
      console.error("Error updating feedback: ", error);
      throw error;
    }
  };
  
  export const deleteFeedback = async (id) => {
    try {
      await deleteDoc(doc(db, 'feedbacks', id));
      console.log("Feedback deleted successfully");
    } catch (error) {
      console.error("Error deleting feedback: ", error);
      throw error;
    }
  };
  
  export const addComment = async (feedbackId, comment) => {
    try {
      const feedbackRef = doc(db, 'feedbacks', feedbackId);
      await updateDoc(feedbackRef, {
        comments: [...(await getFeedback(feedbackId)).comments, comment]
      });
      console.log("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment: ", error);
      throw error;
    }
  };
  
  export const getFeedback = async (id) => {
    try {
      const docRef = doc(db, 'feedbacks', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error("Feedback not found");
      }
    } catch (error) {
      console.error("Error fetching feedback: ", error);
      throw error;
    }
  };

