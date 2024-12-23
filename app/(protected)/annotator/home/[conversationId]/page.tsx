"use client";

import { useEffect, useState } from "react";
import { Annotation, Conversation } from "@/types/conversations";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [userAnswer, setUserAnswer] = useState<string[] | null>(null);

  useEffect(() => {
    params
      .then(({ conversationId }) => {
        setConversationId(conversationId);

        fetch(`/api/conversations/${conversationId}`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch conversation");
            return res.json();
          })
          .then((data) => {
            setConversation(data);
          })
          .catch((error) => {
            console.error("Error fetching conversation:", error);
            setError("Failed to load conversation");
          });
      })
      .catch((error) => {
        console.error("Error resolving params:", error);
        setError("Invalid conversation ID");
      });
  }, [params]);

  const handleEditAnswer = (annotation: Annotation) => {
    setEditingAnnotation(annotation);
    setModalOpen(true);
    setUserAnswer(annotation.answers || []);
  };

  const handleSaveAnswer = () => {
    if (!editingAnnotation?._id || !conversationId) return;
    fetch("/api/conversations/${conversationId}", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: conversationId,
        annotationId: editingAnnotation._id,
        updatedFields: {
          answers: userAnswer,
        },
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save answer");
        return res.json();
      })
      .then(() => {
        setConversation((prev) =>
          prev
            ? {
                ...prev,
                annotations: prev.annotations?.map((annotation) =>
                  annotation._id === editingAnnotation._id
                    ? { ...annotation, answers: userAnswer }
                    : annotation
                ),
              }
            : null
        );
        setModalOpen(false);
        setEditingAnnotation(null);
        setUserAnswer([]);
      })
      .catch((err) => console.error("Error saving answer:", err));
  };

  if (error) {
    return <p className="text-red-500 p-4">{error}</p>;
  }

  if (!conversation) {
    return <p className="p-4 w-width">Loading conversation...</p>;
  }

  return (
    <div className="p-4">
      <div>
        <h1 className="text-2xl font-bold">Home: Annotate The Message</h1>
        <table className="w-full mt-2 border border-white shadow-sm mb-3">
          <thead>
            <tr>
              <th
                className="border-white border py-2 px-4 text-left"
                style={{ width: "30%" }}
              >
                Title
              </th>
              <th
                className="border-white border py-2 px-4 text-left"
                style={{ width: "60%" }}
              >
                Answer
              </th>
              <th
                className="border-white border py-2 px-4 text=center"
                style={{ width: "10%" }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {conversation.annotations?.map((annotation) => (
              <tr key={annotation._id}>
                <td className="py-2 px-4 border-white border">
                  {annotation.title}
                </td>
                <td className="py-2 px-4 border-white border">
                  {Array.isArray(annotation.answers)
                    ? annotation.answers.join(", ") // For multiple answers
                    : annotation.answers || "No answer provided"}{" "}
                  {/* For text or no answer */}
                </td>
                <td className="py-2 px-4 border-b border-gray-300 text-center">
                  <button
                    className="px-3 py-1 text-sm text-white bg-blue-500 rounded-md shadow hover:bg-blue-400 focus:ring-2 focus:ring-blue-300 transition ease-in-out"
                    onClick={() => handleEditAnswer(annotation)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {modalOpen && editingAnnotation && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
              modalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div
              className={`bg-blue-800 rounded-lg shadow-lg p-6 w-96 transform transition-transform duration-300 ${
                modalOpen ? "scale-100" : "scale-95"
              }`}
            >
              <h2 className="text-white text-lg text-2xl font-bold mb-4">
                {editingAnnotation.title}
              </h2>

              {/* Textbox for single-line input */}
              {editingAnnotation.type === "textbox" && (
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your answer"
                  value={userAnswer ? userAnswer[0] : ""}
                  onChange={(e) => setUserAnswer([e.target.value])}
                />
              )}

              {/* Dropdown for multiple choice */}
              {editingAnnotation.type === "multiple choice" && (
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                  value={userAnswer ? userAnswer[0] : ""}
                  onChange={(e) => setUserAnswer([e.target.value])}
                >
                  <option value="">Select an Option</option>
                  {editingAnnotation.options?.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {/* Checkboxes for multiple answers */}
              {editingAnnotation.type === "multiple answers" && (
                <div className="mt-4">
                  {editingAnnotation.options?.map((option, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        checked={(userAnswer as string[]).includes(option)}
                        onChange={(e) =>
                          setUserAnswer((prev) =>
                            e.target.checked
                              ? [...(prev as string[]), option]
                              : (prev as string[]).filter(
                                  (ans) => ans !== option
                                )
                          )
                        }
                      />
                      <label className="ml-2 text-white">{option}</label>
                    </div>
                  ))}
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex justify-end mt-6">
                <button
                  className="px-4 py-2 mr-2 bg-green-500 text-white rounded shadow hover:bg-green-400 focus:ring-2 focus:ring-green-300 transition ease-in-out"
                  onClick={handleSaveAnswer}
                >
                  Save
                </button>
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded shadow hover:bg-gray-400 focus:ring-2 focus:ring-gray-300 transition ease-in-out"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="space-y-4">
        {conversation.messages.map((message, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              message.role === "user"
                ? "bg-blue-900 text-white ml-auto"
                : "bg-gray-700 text-gray-300 mr-auto"
            }`}
          >
            <p
              className={`font-semibold ${
                message.role === "user" ? "text-blue-100" : "text-blue-400"
              }`}
            >
              {message.role === "user" ? "You" : "AI"}
            </p>
            <p className="mt-2 leading-relaxed">{message.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
