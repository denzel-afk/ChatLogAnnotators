"use client";

import { useEffect, useState } from "react";
import { Conversation, Annotation } from "@/types/conversations";

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
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [targetAnnotation, setTargetAnnotation] = useState<Annotation | null>(
    null
  );

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

    console.log("Deleting annotation...");

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
        console.log("Annotation deleted successfully");
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
    return <p className="bg-black p-4">Loading conversation...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold pb-4">Admin: Manage Annotations</h1>
      <h2 className="text-l font-bold">Conversation Annotation</h2>
      <table className="w-full mt-4 border outline-white outline">
        <thead>
          <tr>
            <th className="border border-white" style={{ width: "20%" }}>
              Title
            </th>
            <th className="border border-white" style={{ width: "10%" }}>
              Type
            </th>
            <th className="border border-white" style={{ width: "50%" }}>
              Choices
            </th>
            <th style={{ width: "20%" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {conversation.annotations?.map((annotation) => (
            <tr key={annotation._id}>
              <td className="text-base break-words border border-white p-2">
                {annotation.title}
              </td>
              <td className="text-base break-words border border-white p-2">
                {annotation.type}
              </td>
              <td className="border-white border">
                {annotation.type !== "scaler" ? (
                  annotation.options?.map((option, index) => (
                    <p key={index} className="text-sm break-words pl-2 pr-1">
                      - {option}
                    </p>
                  ))
                ) : (
                  <div>
                    <p className="text-sm break-words pl-2 pr-1">
                      Min Value: {annotation.options?.[0]}
                    </p>
                    <p className="text-sm break-words pl-2 pr-1">
                      Max Value: {annotation.options?.[1]}
                    </p>
                    <p className="text-sm break-words pl-2 pr-1">
                      Step Value: {annotation.options?.[2]}
                    </p>
                  </div>
                )}
              </td>
              <td className="py-2 px-4 border-b border-gray-300 text-center border-white border">
                <button
                  className="mb-2 px-3 py-1 text-sm text-white bg-blue-500 rounded-md shadow hover:bg-blue-400 focus:ring-2 focus:ring-blue-300 transition ease-in-out"
                  onClick={() => {
                    setNewAnnotation({
                      _id: annotation._id || "",
                      title: annotation.title || "",
                      type: annotation.type || "multiple choice",
                      options: annotation.options || [],
                      answers: annotation.answers || [],
                    });
                    setModalOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="ml-2 px-3 py-1 text-sm text-white bg-red-500 rounded-md shadow hover:bg-red-400 focus:ring-2 focus:ring-red-300 transition ease-in-out"
                  onClick={() => {
                    setDeleteModal(true);
                    setTargetAnnotation(annotation);
                  }}
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

      {deleteModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
            deleteModal ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className={`bg-blue-800 rounded-lg shadow-lg p-6 w-80 transform transition-transform duration-300 ${
              deleteModal ? "scale-100" : "scale-95"
            }`}
          >
            <h2 className="text-white text-lg font-bold mb-4">
              Delete Annotation
            </h2>
            <p className="text-gray-300 text-sm mb-6">
              Are you sure you want to delete this annotation?
              <strong className="block text-white mt-2">
                {targetAnnotation?.title}
              </strong>
            </p>
            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-400 focus:ring-2 focus:ring-red-300 transition ease-in-out"
                onClick={() => {
                  if (targetAnnotation?._id) {
                    handleDeleteAnnotation(targetAnnotation._id);
                  }
                  setDeleteModal(false);
                }}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md shadow hover:bg-gray-400 focus:ring-2 focus:ring-gray-300 transition ease-in-out"
                onClick={() => setDeleteModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
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
            <h2 className="text-white text-lg font-bold mb-4">
              {newAnnotation?._id ? "Edit Annotation" : "Add Annotation"}
            </h2>
            <input
              type="text"
              placeholder="Title"
              className="border p-2 w-full mb-4 rounded"
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
              className="border p-2 w-full mb-4 rounded"
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
              <option value="scaler">Scaler</option>
            </select>

            {(newAnnotation?.type === "multiple choice" ||
              newAnnotation?.type === "multiple answers") && (
              <div className="mb-4">
                <h3 className="font-bold mb-2 text-white">Options</h3>
                {newAnnotation.options?.map((option, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={option}
                      className="border p-2 flex-grow rounded"
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
                      className="ml-2 px-2 py-1 bg-red-500 text-white rounded shadow hover:bg-red-400 focus:ring-2 focus:ring-red-300 transition ease-in-out"
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
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-400 focus:ring-2 focus:ring-blue-300 transition ease-in-out"
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
            {newAnnotation?.type === "scaler" && (
              <div className="mb-4">
                <h3 className="font-bold mb-2 text-white">Scaler Range</h3>
                <div className="flex space-x-4 mb-4">
                  <input
                    type="number"
                    className="border p-2 rounded w-1/2"
                    placeholder="Min Value"
                    value={newAnnotation.options?.[0] || ""}
                    onChange={(e) =>
                      setNewAnnotation((prev) =>
                        prev
                          ? {
                              ...prev,
                              options: [
                                e.target.value,
                                prev.options?.[1] || "10",
                                prev.options?.[2] || "1",
                              ],
                            }
                          : null
                      )
                    }
                  />
                  <input
                    type="number"
                    className="border p-2 rounded w-1/2"
                    placeholder="Max Value"
                    value={newAnnotation.options?.[1] || ""}
                    onChange={(e) =>
                      setNewAnnotation((prev) =>
                        prev
                          ? {
                              ...prev,
                              options: [
                                prev.options?.[0] || "1",
                                e.target.value,
                                prev.options?.[2] || "1",
                              ],
                            }
                          : null
                      )
                    }
                  />
                </div>
                <input
                  type="number"
                  className="border p-2 rounded w-1/2"
                  placeholder="Step Value"
                  value={newAnnotation.options?.[2] || ""}
                  onChange={(e) =>
                    setNewAnnotation((prev) =>
                      prev
                        ? {
                            ...prev,
                            options: [
                              prev.options?.[0] || "1",
                              prev.options?.[1] || "10",
                              e.target.value,
                            ],
                          }
                        : null
                    )
                  }
                />
              </div>
            )}

            <div className="flex justify-end">
              <button
                className="px-4 py-2 mr-2 bg-green-500 text-white rounded shadow hover:bg-green-400 focus:ring-2 focus:ring-green-300 transition ease-in-out"
                onClick={() => {
                  if (newAnnotation?._id) {
                    handleEditAnnotation(newAnnotation._id, {
                      title: newAnnotation.title,
                      type: newAnnotation.type,
                      options: newAnnotation.options,
                    });
                  } else {
                    handleAddAnnotation();
                  }
                  setModalOpen(false);
                  setNewAnnotation(null);
                }}
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
