import React, { useState, useEffect } from 'react';
import './UserFeedback.scss';
import Sidebar from '../../Components/Sidebar/Sidebar';
import Navbar from '../../Components/Navbar/Navbar';
import { Share2, MessageCircle, Trash2, Star } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFeedbacks, deleteFeedback, addComment, updateFeedback, handleUpdateRating } from '../../feedbackUtils'

function StarRating({ rating }) {
  return (
    <div className="rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          fill={star <= rating ? 'currentColor' : 'none'}
          className={star <= rating ? 'star' : 'star-empty'}
        />
      ))}
    </div>
  )
}

function FeedbackCard({ feedback, onDelete, onShare, onRespond }) {

  const { avatar, name } = feedback.user;
  const { date, content, rating, comments } = feedback;

  const formattedDate = date
    ? (date.toDate ? new Date(date.toDate()).toLocaleDateString() : new Date(date).toLocaleDateString())
    : 'Unknown Date';

  return (
    <div className="feedback-card">
      <div className="feedback-header">
        <div className="user-info">
          <img src={feedback.user.avatar} alt="" className="user-avatar" />
          <div className="user-details">
            <span className="user-name">{feedback.user.name}</span>
            <span className="feedback-date">{formattedDate}</span>
          </div>
        </div>
        <StarRating rating={feedback.user.rating} />
      </div>
      <p className="feedback-content">{feedback.user.content}</p>
      <div className="feedback-actions">
        <div className="action-buttons">
          <button className="btn btn-outline" onClick={() => onShare(feedback.id)}>
            <Share2 size={16} />
            Share Feedback
          </button>
          <button className="btn btn-primary" onClick={() => onRespond(feedback.id)}>
            <MessageCircle size={16} />
            Respond
          </button>
        </div>
        <div className="action-buttons">
          <button className="btn btn-danger" onClick={() => onDelete(feedback.id)}>
            <Trash2 size={16} />
            Delete Feedback
          </button>
          <div className="comments-count">
            <MessageCircle size={16} />
            {feedback.user.comments}
          </div>
        </div>
      </div>
    </div>
  )
}

function UserFeedback() {
  const [feedbacks, setFeedbacks] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'feedbacks'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const feedbacksArray = querySnapshot.docs.map((doc) => {
        console.log('Feedbacks:', feedbacks);
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      setFeedbacks(feedbacksArray);
    });
  
    return () => unsubscribe();
  }, []); 

  const handleDelete = async (id) => {
    try {
      await deleteFeedback(id)
      setFeedbacks(feedbacks.filter(feedback => feedback.id !== id))
    } catch (error) {
      console.error("Error deleting feedback: ", error)
    }
  }

  const handleShare = (id) => {
    const feedback = feedbacks.find((feedback) => feedback.id === id);
    const shareData = {
      title: `Feedback from ${feedback.user.name}`,
      text: feedback.content,
      url: window.location.origin + `/feedbacks/${id}`,
    };
  
    if (navigator.share) {
      navigator.share(shareData)
        .then(() => console.log("Feedback shared successfully"))
        .catch((error) => console.error("Error sharing feedback:", error));
    } else {
      navigator.clipboard.writeText(shareData.url)
        .then(() => alert("Feedback link copied to clipboard!"))
        .catch((error) => console.error("Error copying link:", error));
    }
  };

  const handleRespond = (id) => {
    const feedback = feedbacks.find((feedback) => feedback.id === id);
    const response = prompt(`Respond to ${feedback.user.name}'s feedback:\n"${feedback.content}"`);

    if (response) {
      console.log(`Response to feedback ${id}: ${response}`);
      updateDoc(doc(db, "feedbacks", id), {
        response: response,
        respondedAt: serverTimestamp(),
      })
        .then(() => alert("Response sent!"))
        .catch((error) => console.error("Error responding to feedback:", error));
    }
  };

  const handleUpdateRating = async (id, newRating) => {
    try {
      await updateFeedback(id, { rating: newRating })
      setFeedbacks(feedbacks.map(feedback => 
        feedback.id === id ? { ...feedback, rating: newRating } : feedback
      ))
    } catch (error) {
      console.error("Error updating rating: ", error)
    }
  };


  return (
    <div className="feedback">
      <Sidebar />
      <div className="feedbackContainer">
        <Navbar />
        <div className="feedbackTitle">User Feedback Management</div>
        <main>
          {feedbacks.length > 0 ? (
            feedbacks.map((feedback) => (
              <FeedbackCard
              key={feedback.id} 
              feedback={feedback} 
              onDelete={handleDelete}
              onShare={handleShare}
              onRespond={handleRespond}
              />
            ))
          ) : (
            <p>No feedback available.</p>
          )}
        </main>
      </div>
    </div>
  );
}

export default UserFeedback;
