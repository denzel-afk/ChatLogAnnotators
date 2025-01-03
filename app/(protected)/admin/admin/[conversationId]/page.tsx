"use client";

import { useEffect, useState } from "react";
import { Conversation, Annotation } from "@/types/conversations";
import { toast } from "react-toastify";

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
    locality?: boolean;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [allMessages, setAllMessages] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [targetAnnotation, setTargetAnnotation] = useState<Annotation | null>(
    null
  );
  const [activeMessageIndex, setActiveMessageIndex] = useState<number | null>(
    null
  );
  const [messageAnnotation, setMessageAnnotation] = useState<
    Annotation[] | null
  >(null);
  const [loading, setLoading] = useState<boolean>(false);
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
            const annotationsFromMessages =
              data.messages?.[0]?.annotations || [];
            setMessageAnnotation(annotationsFromMessages);
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

  // admin adding annotation on conversation level handler
  const handleAddAnnotation = () => {
    if (!newAnnotation || !newAnnotation.title || !newAnnotation.type) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);

    fetch(`/api/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        annotation: { ...newAnnotation, _id: undefined },
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add annotation");
        return res.json();
      })
      .then(() => {
        toast.success("Annotation added successfully");
        setModalOpen(false);
        setNewAnnotation(null);
        setConversation(
          (
            prev: any /* eslint-disable-line @typescript-eslint/no-explicit-any */
          ) =>
            prev
              ? {
                  ...prev,
                  annotations: [...(prev.annotations || []), newAnnotation],
                }
              : null
        );
        fetch(`/api/conversations/${conversationId}`)
          .then((res) => res.json())
          .then((data) => setConversation(data));
      })
      .catch((err) => {
        console.error("Error adding annotation:", err);
        toast.error("Failed to add annotation");
      })
      .finally(() => setLoading(false));
  };

  // admin deleting annotation on conversation level handler
  const handleDeleteAnnotation = (annotationId: string) => {
    if (!conversationId || !annotationId) return;

    console.log("Deleting annotation...");

    setLoading(true);

    fetch(`/api/conversations/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ annotationId }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete annotation");
        return res.json();
      })
      .then(() => {
        toast.success("Annotation deleted successfully");
        fetch(`/api/conversations/${conversationId}`)
          .then((res) => res.json())
          .then((data) => setConversation(data))
          .catch((err) => console.error("Error refreshing conversation:", err));
      })
      .catch((err) => {
        console.error("Error deleting annotation:", err);
        toast.error("Failed to delete annotation");
      })
      .finally(() => setLoading(false));
  };

  //admin editing annotation on conversation level handler
  const handleEditAnnotation = (
    annotationId: string,
    updatedFields: Partial<Annotation>
  ) => {
    if (!conversationId || !annotationId) {
      console.error("Missing required fields for editing annotation");
      return;
    }

    setLoading(true);

    fetch(`/api/conversations`, {
      // Updated to use global endpoint
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ annotationId, updatedFields }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to edit annotation");
        return res.json();
      })
      .then(() => {
        toast.success("Annotation edited successfully");
        // Fetch all conversations to reflect updates
        fetch(`/api/conversations/${conversationId}`)
          .then((res) => res.json())
          .then((data) => setConversation(data));
      })
      .catch((err) => console.error("Error editing annotation:", err))
      .finally(() => setLoading(false));
  };

  // admin adding annotation on all messages level handler
  const handleAddllMessageAnnotation = () => {
    if (
      !newAnnotation ||
      !newAnnotation.title ||
      !newAnnotation.type ||
      !conversationId
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);

    fetch(`/api/conversations/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        annotation: {
          title: newAnnotation.title,
          type: newAnnotation.type,
          options: newAnnotation.options || [],
          answers: newAnnotation.answers || [],
          locality: false,
        },
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to add annotation");
        }
        return res.json();
      })
      .then(() => {
        toast.success("Annotation added to all messages succesfully");
        fetch(`/api/conversations/${conversationId}`)
          .then((res) => res.json())
          .then((data) => setConversation(data));
        setAllMessages(false);
        setNewAnnotation(null);
      })
      .catch((err) => {
        console.error("Error adding annotation:", err);
        toast.error("Failed to add annotation to all messages");
      })
      .finally(() => setLoading(false));
  };

  // admin deleting annotation on all messages level handler
  const handleDeletellMessageAnnotation = (annotationId: string) => {
    if (!conversationId || !annotationId) {
      toast.error("Missing required fields for deleting annotation");
      return;
    }

    setLoading(true);

    fetch(`/api/conversations/messages`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ annotationId }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete annotation");
        }
        return res.json();
      })
      .then(() => {
        toast.success("Annotation deleted successfully");
        fetch(`/api/conversations/${conversationId}`)
          .then((res) => res.json())
          .then((data) => setConversation(data));
      })
      .catch((err) => {
        console.error("Error deleting annotation:", err);
        toast.error("Failed to delete annotation");
      })
      .finally(() => setLoading(false));
  };

  // admin editing annotation on all messages level handler
  const handleEditllMessageAnnotation = (
    updatedFields: Partial<Annotation>
  ) => {
    if (
      !conversationId ||
      !newAnnotation?._id ||
      !newAnnotation.title ||
      !newAnnotation.type
    ) {
      toast.error(
        "Missing required fields for editing annotation or annotation is not global"
      );
      return;
    }

    setLoading(true);

    fetch(`/api/conversations/messages`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ annotationId: newAnnotation._id, updatedFields }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to edit annotation");
        }
        return res.json();
      })
      .then(() => {
        toast.success("Annotation edited successfully");
        fetch(`/api/conversations/${conversationId}`)
          .then((res) => res.json())
          .then((data) => setConversation(data));
      })
      .catch((err) => {
        console.error("Error editing annotation:", err);
        toast.error("Failed to edit annotation");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="p-4 bg-background text-foreground h-screen">
      <h1 className="text-xl font-bold pb-4">Admin: Manage Annotations</h1>
      <h2 className="text-lg font-semibold mb-4">Conversation Annotation</h2>
      <table className="w-full mt-4 border">
        <thead className="bg-secondary text-secondary-foreground">
          <tr>
            <th className="border" style={{ width: "20%" }}>
              Title
            </th>
            <th className="border" style={{ width: "10%" }}>
              Type
            </th>
            <th className="border" style={{ width: "50%" }}>
              Choices
            </th>
            <th className="border" style={{ width: "20%" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {conversation?.annotations?.map((annotation) => (
            <tr key={annotation._id} className="even:bg-muted">
              <td className="border p-2">{annotation.title}</td>
              <td className="border p-2">{annotation.type}</td>
              <td className="border">
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
              <td className="py-2 px-4 border-b text-center border">
                <button
                  className="mb-2 px-3 py-1 text-sm text-white bg-green-500 rounded-md shadow hover:bg-green-400 focus:ring-2 focus:ring-blue-300 transition ease-in-out"
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
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-400 focus:ring-2 focus:ring-green-300 transition ease-in-out"
        onClick={() => setModalOpen(true)}
      >
        Add Annotation
      </button>

      {deleteModal && (
        <div
          className={`fixed inset-0 bg-background bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
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
          className={`fixed inset-0 bg-background bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
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

      {allMessages && (
        <div
          className={`fixed inset-0 bg-background bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
            allMessages ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className={`bg-blue-800 rounded-lg shadow-lg p-6 w-96 transform transition-transform duration-300 ${
              allMessages ? "scale-100" : "scale-95"
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
                    handleEditllMessageAnnotation(newAnnotation!);
                  } else {
                    handleAddllMessageAnnotation();
                  }
                  setAllMessages(false);
                  setNewAnnotation(null);
                }}
              >
                Save
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded shadow hover:bg-gray-400 focus:ring-2 focus:ring-gray-300 transition ease-in-out"
                onClick={() => setAllMessages(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl shadow-2xl p-8 flex flex-col items-center justify-center animate-pulse">
            <svg
              className="animate-spin h-16 w-16 text-white mb-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
            <p className="text-white text-xl font-semibold">Please wait...</p>
            <p className="text-gray-300 text-sm mt-2">
              Processing your request, this may take a few seconds.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4 mt-8">
        {/* Table for Global Annotations (locality: false) */}
        <h3 className="text-lg font-semibold mb-2">
          Global Message Annotation
        </h3>
        <p className="text-sm text-gray-300 mb-4">
          Watch out that there is no modal for delete button in the message
          level, so once you clicked the delete button it will be deleted
          automatically without any warning
        </p>
        <table className="w-full border">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="border" style={{ width: "20%" }}>
                Title
              </th>
              <th className="border" style={{ width: "10%" }}>
                Type
              </th>
              <th className="border" style={{ width: "50%" }}>
                Choices
              </th>
              <th className="border" style={{ width: "20%" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {messageAnnotation &&
              messageAnnotation.map((annotation) => (
                <tr key={annotation._id} className="even:bg-secondary">
                  <td className="border p-2">{annotation.title}</td>
                  <td className="border p-2">{annotation.type}</td>
                  <td className="border">
                    {annotation.type !== "scaler" ? (
                      annotation.options?.map((option, index) => (
                        <p
                          key={index}
                          className="text-sm break-words pl-2 pr-1"
                        >
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
                  <td className="py-2 px-4 border-b text-center border">
                    <button
                      className="mb-2 px-3 py-1 text-sm text-white bg-green-500 rounded-md shadow hover:bg-blue-400 focus:ring-2 focus:ring-blue-300 transition ease-in-out"
                      onClick={() => {
                        setNewAnnotation({
                          _id: annotation._id || "",
                          title: annotation.title || "",
                          type: annotation.type || "multiple choice",
                          options: annotation.options || [],
                          answers: annotation.answers || [],
                        });
                        setAllMessages(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="ml-2 px-3 py-1 text-sm text-white bg-red-500 rounded-md shadow hover:bg-red-400 focus:ring-2 focus:ring-red-300 transition ease-in-out"
                      onClick={() => {
                        handleDeletellMessageAnnotation(annotation._id);
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
          className="bg-green-500 p-2 text-white rounded-md hover:bg-green-400 ease-in-out transition duration-300"
          onClick={() => setAllMessages(true)}
        >
          Add Annotation for All Messages
        </button>
      </div>
    </div>
  );
}
