"use client";

import { useEffect, useState } from "react";
import { Conversation, Message, Annotation } from "@/types/conversations";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [newAnnotation, setNewAnnotation] = useState<{
    _id?: string;
    title: string;
    type: string;
    options?: string[];
    answers?: string[];
  } | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

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

  const handleAddAnnotation = () => {
    if (!newAnnotation || !newAnnotation.title || !newAnnotation.type) {
      alert("Please fill in all fields.");
      return;
    }

    fetch(`/api/conversations/${conversationId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: conversationId,
        annotation: { ...newAnnotation, _id: undefined }, // Let the backend generate _id
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add annotation");
        return res.json();
      })
      .then(() => {
        setModalOpen(false);
        setNewAnnotation(null);
        // Fetch updated conversation data
        fetch(`/api/conversations/${conversationId}`)
          .then((res) => res.json())
          .then((data) => setConversation(data));
      })
      .catch((err) => console.error("Error adding annotation:", err));
  };

  const handleDeleteAnnotation = (annotationId: string) => {
    if (!conversationId || !annotationId) return;

    fetch(`/api/conversations/${conversationId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: conversationId, annotationId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete annotation");
        return res.json();
      })
      .then(() => {
        setConversation((prev) =>
          prev
            ? {
                ...prev,
                annotations: prev.annotations?.filter(
                  (annotation) => annotation._id !== annotationId
                ),
              }
            : null
        );
      })
      .catch((err) => console.error("Error deleting annotation:", err));
  };

  const handleEditAnnotation = (
    annotationId: string,
    updatedFields: Partial<Annotation>
  ) => {
    fetch(`/api/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: conversationId, annotationId, updatedFields }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to edit annotation");
        return res.json();
      })
      .then(() => {
        setConversation((prev) =>
          prev
            ? {
                ...prev,
                annotations: prev.annotations?.map((annotation) =>
                  annotation._id === annotationId
                    ? { ...annotation, ...updatedFields }
                    : annotation
                ),
              }
            : null
        );
      })
      .catch((err) => console.error("Error editing annotation:", err));
  };

  if (error) {
    return <p className="text-red-500 p-4">{error}</p>;
  }

  if (!conversation) {
    return <p className="p-4">Loading conversation...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Admin: Manage Annotations</h1>
      <table className="w-full mt-4 border">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {conversation.annotations?.map((annotation) => (
            <tr key={annotation._id}>
              <td>{annotation.title}</td>
              <td>{annotation.type}</td>
              <td>
                <button
                  className="text-blue-500"
                  onClick={() => {
                    setNewAnnotation({
                      _id: annotation._id || "",
                      title: annotation.title || "",
                      type: annotation.type || "multiple choice",
                      options: annotation.options || [],
                      answers: annotation.answers || [], // Normalize null to an empty array
                    });
                    setModalOpen(true);
                  }}
                >
                  Edit
                </button>

                <button
                  className="text-red-500 ml-2"
                  onClick={() => handleDeleteAnnotation(annotation._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => setModalOpen(true)}
      >
        Add Annotation
      </button>

      {modalOpen && (
        <div className="modal">
          <div className="modal-content p-4 mt-4 bg-blue-800 rounded shadow-md w-full outline outline-1 outline-white">
            <h2 className="text-xl font-bold mb-4">Add Annotation</h2>
            <input
              type="text"
              placeholder="Title"
              className="border p-2 w-full mb-4"
              value={newAnnotation?.title || ""}
              onChange={(e) =>
                setNewAnnotation((prev) => ({
                  ...prev,
                  title: e.target.value,
                  type: prev?.type || "multiple choice",
                  options: prev?.options || [],
                }))
              }
            />
            <select
              className="border p-2 w-full mb-4"
              value={newAnnotation?.type || "multiple choice"}
              onChange={(e) =>
                setNewAnnotation((prev) => ({
                  ...prev,
                  type: e.target.value,
                  title: prev?.title || "",
                  options:
                    e.target.value === "textbox" ? [] : prev?.options || [],
                }))
              }
            >
              <option value="multiple choice">Multiple Choice</option>
              <option value="multiple answers">Multiple Answers</option>
              <option value="textbox">Textbox</option>
            </select>

            {(newAnnotation?.type === "multiple choice" ||
              newAnnotation?.type === "multiple answers") && (
              <div className="mb-4">
                <h3 className="font-bold mb-2">Options</h3>
                {newAnnotation.options?.map((option, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={option}
                      className="border p-2 flex-grow"
                      placeholder={`Option ${index + 1}`}
                      onChange={(e) =>
                        setNewAnnotation((prev) =>
                          prev
                            ? {
                                ...prev,
                                options: prev.options?.map((opt, i) =>
                                  i === index ? e.target.value : opt
                                ),
                              }
                            : {
                                title: "",
                                type: "multiple choice",
                                options: [],
                              }
                        )
                      }
                    />
                    <button
                      className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() =>
                        setNewAnnotation((prev) =>
                          prev
                            ? {
                                ...prev,
                                options: prev.options?.filter(
                                  (_, i) => i !== index
                                ),
                              }
                            : {
                                title: "",
                                type: "multiple choice",
                                options: [],
                              }
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded "
                  onClick={() =>
                    setNewAnnotation((prev) =>
                      prev
                        ? {
                            ...prev,
                            options: [...(prev.options || []), ""],
                          }
                        : { title: "", type: "multiple choice", options: [""] }
                    )
                  }
                >
                  Add Option
                </button>
              </div>
            )}

            <div className="flex justify-end">
              <button
                className="px-4 py-2 mr-2 bg-green-500 text-white rounded ml-2 outline outline-2 outline-white hover:bg-green-400 hover:text-slate-600 transition ease-in ease-out"
                onClick={() => {
                  if (newAnnotation?._id) {
                    // If _id exists, it's an edit
                    handleEditAnnotation(newAnnotation._id, {
                      title: newAnnotation.title,
                      type: newAnnotation.type,
                      options: newAnnotation.options,
                    });
                  } else {
                    // Otherwise, it's a new annotation
                    handleAddAnnotation();
                  }
                  setModalOpen(false);
                  setNewAnnotation(null);
                }}
              >
                Save
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded outline outline-2 outline-white hover:bg-gray-400 hover:text-slate-600 transition ease-in ease-out"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 mt-8">
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
