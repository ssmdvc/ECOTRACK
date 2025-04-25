import React, { useState, useEffect } from "react";
import "./UserFeedback.scss";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { Share2, MessageCircle, Trash2, Star } from "lucide-react";
import { db } from "../../firebase";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { deleteFeedback, updateFeedback } from "../../feedbackUtils";

function StarRating({ rating }) {
  return (
    <div className="rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          fill={star <= rating ? "currentColor" : "none"}
          className={star <= rating ? "star" : "star-empty"}
        />
      ))}
    </div>
  );
}

function FeedbackCard({ feedback, onDelete, onShare, onRespond }) {
  const formattedDate = feedback.date
    ? new Date(feedback.date).toLocaleDateString()
    : "Unknown Date";

  return (
    <div className="feedback-card">
      <div className="feedback-header">
        <div className="user-info">
          <div className="user-details">
            <span className="user-name">{feedback.email || "Anonymous"}</span>
            <span className="feedback-date">{formattedDate}</span>
          </div>
        </div>
        <StarRating rating={feedback.rating || 0} />
      </div>

      <p className="feedback-content">
        <strong>Category:</strong> {feedback.category}
      </p>
      <p className="feedback-content">
        <strong>Description:</strong> {feedback.description}
      </p>
      <p className="feedback-content">
        <strong>Address:</strong> {feedback.address}
      </p>

      <div className="feedback-actions">
        <div className="action-buttons">
          <button
            className="btn btn-outline"
            onClick={() => onShare(feedback.id)}
          >
            <Share2 size={16} />
            Share Feedback
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onRespond(feedback.id)}
          >
            <MessageCircle size={16} />
            Respond
          </button>
        </div>
        <div className="action-buttons">
          <button
            className="btn btn-danger"
            onClick={() => onDelete(feedback.id)}
          >
            <Trash2 size={16} />
            Delete Feedback
          </button>
        </div>
      </div>
    </div>
  );
}

function UserFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "feedback"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const feedbacksArray = querySnapshot.docs.map((doc) => {
        console.log("Feedbacks:", feedbacks);
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
      await deleteFeedback(id);
      setFeedbacks(feedbacks.filter((feedback) => feedback.id !== id));
    } catch (error) {
      console.error("Error deleting feedback: ", error);
    }
  };

  const handleShare = (id) => {
    const feedback = feedbacks.find((feedback) => feedback.id === id);
    const shareData = {
      title: `Feedback from ${feedback.email}`,
      text: feedback.content,
      url: window.location.origin + `/feedback/${id}`,
    };

    if (navigator.share) {
      navigator
        .share(shareData)
        .then(() => console.log("Feedback shared successfully"))
        .catch((error) => console.error("Error sharing feedback:", error));
    } else {
      navigator.clipboard
        .writeText(shareData.url)
        .then(() => alert("Feedback link copied to clipboard!"))
        .catch((error) => console.error("Error copying link:", error));
    }
  };

  const handleRespond = (id) => {
    const feedback = feedbacks.find((feedback) => feedback.id === id);
    const response = prompt(
      `Respond to ${feedback.email}'s feedback:\n"${feedback.content}"`
    );

    if (response) {
      console.log(`Response to feedback ${id}: ${response}`);
      updateDoc(doc(db, "feedback", id), {
        response: response,
        respondedAt: serverTimestamp(),
      })
        .then(() => alert("Response sent!"))
        .catch((error) =>
          console.error("Error responding to feedback:", error)
        );
    }
  };

  const handleUpdateRating = async (id, newRating) => {
    try {
      await updateFeedback(id, { rating: newRating });
      setFeedbacks(
        feedbacks.map((feedback) =>
          feedback.id === id ? { ...feedback, rating: newRating } : feedback
        )
      );
    } catch (error) {
      console.error("Error updating rating: ", error);
    }
  };

  return (
    <div className="feedback">
      <Sidebar />
      <div className="feedbackContainer">
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
