"use client";

import { useEffect, useState } from "react";
import { Conversation, Annotation, Comment } from "@/types/conversations";
import { toast } from "react-toastify";
import { decode } from "punycode";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [activeMessageIndex, setActiveMessageIndex] = useState<number | null>(
    null
  );
  const [messageAnnotation, setMessageAnnotation] = useState<Annotation[]>([]);
  const [localCommentContent, setLocalCommentContent] = useState<
    Record<number, string>
  >({});

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
            toast.error("Error fetching conversation:", error);
            setError("Failed to load conversation");
          });
      })
      .catch((error) => {
        toast.error("Error resolving params:", error);
        setError("Invalid conversation ID");
      });
  }, [params]);

  const handleSaveAnswer = (annotationId: string, updatedAnswer: string[]) => {
    if (!conversationId) return;

    fetch(`/api/conversations/${conversationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: conversationId,
        annotationId,
        updatedFields: {
          answers: updatedAnswer,
        },
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save answer");
        return res.json();
      })
      .then(() => {
        toast.success("Answer saved successfully");
        setConversation((prev) =>
          prev
            ? {
                ...prev,
                annotations: prev.annotations?.map((annotation) =>
                  annotation._id === annotationId
                    ? { ...annotation, answers: updatedAnswer }
                    : annotation
                ),
              }
            : null
        );
      })
      .catch((err) => {
        toast.error("Error saving answer:", err);
      });
  };

  const handleSaveMessageAnnotation = (
    annotationId: string,
    updatedAnswer: string[]
  ) => {
    if (!conversationId || activeMessageIndex === null) return;

    fetch(
      `/api/conversations/${conversationId}/messages/${activeMessageIndex}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: conversationId,
          messageIndex: activeMessageIndex,
          annotationId,
          updatedFields: {
            answers: updatedAnswer,
          },
        }),
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save message annotation");
        return res.json();
      })
      .then(() => {
        toast.success("Message annotation saved successfully");
        setConversation((prev) =>
          prev
            ? {
                ...prev,
                messages: prev.messages.map((message, index) =>
                  index === activeMessageIndex
                    ? {
                        ...message,
                        annotations: message.annotations?.map((annotation) =>
                          annotation._id === annotationId
                            ? { ...annotation, answers: updatedAnswer }
                            : annotation
                        ),
                      }
                    : message
                ),
              }
            : null
        );
      })
      .catch((err) => toast.error("Error saving message annotation:", err));
  };

  const handleAddComment = (messageIndex: number, commentContent: string) => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("username="))
      ?.split("=")[1];

    const username = cookieValue
      ? decodeURIComponent(cookieValue)
      : "Anonymous";

    if (!conversationId || !commentContent) return;

    fetch(`/api/conversations/${conversationId}/messages/${messageIndex}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: conversationId,
        comment: {
          name: username,
          timestamp: Date.now(),
          content: commentContent,
        },
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add comment");
        return res.json();
      })
      .then(() => {
        toast.success("Comment added successfully");
        setConversation((prev) =>
          prev
            ? {
                ...prev,
                messages: prev.messages.map((message, index) =>
                  index === messageIndex
                    ? {
                        ...message,
                        comments: [
                          ...(message.comments || []),
                          {
                            _id: new Date().toISOString(),
                            name: username,
                            timestamp: Date.now(),
                            content: commentContent,
                          },
                        ],
                      }
                    : message
                ),
              }
            : null
        );
      })
      .catch((err) => toast.error("Error adding comment: " + err.message));
  };

  const handleDeleteComment = (messageIndex: number, commentId: string) => {
    if (!conversationId || !commentId) return;

    fetch(`/api/conversations/${conversationId}/messages/${messageIndex}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: conversationId,
        commentId,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete comment");
        return res.json();
      })
      .then(() => {
        toast.success("Comment deleted successfully");
        setConversation((prev) =>
          prev
            ? {
                ...prev,
                messages: prev.messages.map((message, index) =>
                  index === messageIndex
                    ? {
                        ...message,
                        comments: message.comments?.filter(
                          (comment) => comment._id !== commentId
                        ),
                      }
                    : message
                ),
              }
            : null
        );
      })
      .catch((err) => toast.error("Error deleting comment: " + err.message));
  };

  if (error) {
    return <p className="text-red-500 p-4">{error}</p>;
  }

  if (!conversation) {
    return (
      <p className="bg-muted text-muted-foreground p-4 w-width">
        Loading conversation...
      </p>
    );
  }

  return (
    <div className="p-4 bg-background text-foreground h-screen flex flex-col">
      <div className="flex-none">
        <h1 className="text-2xl font-bold text-foreground">
          Home: Annotate The Message
        </h1>
        <table className="w-full mt-2 border border-muted shadow-sm mb-3 text-foreground">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th
                className="border py-2 px-4 text-left"
                style={{ width: "30%" }}
              >
                Title
              </th>
              <th
                className="border py-2 px-4 text-left"
                style={{ width: "60%" }}
              >
                Answer
              </th>
            </tr>
          </thead>
          <tbody>
            {conversation.annotations?.map((annotation) => (
              <tr key={annotation._id} className="even:bg-secondary">
                <td className="py-2 px-4 border border-muted">
                  {annotation.title}
                </td>
                <td className="py-2 px-4 border border-muted">
                  {annotation.type === "textbox" && (
                    <textarea
                      className="w-full p-2 border border-muted rounded-md bg-card text-card-foreground resize-none"
                      value={annotation.answers?.[0] || ""}
                      onChange={(e) =>
                        setConversation((prev) =>
                          prev
                            ? {
                                ...prev,
                                annotations: prev.annotations?.map((a) =>
                                  a._id === annotation._id
                                    ? { ...a, answers: [e.target.value] }
                                    : a
                                ),
                              }
                            : null
                        )
                      }
                      onBlur={(e) =>
                        handleSaveAnswer(annotation._id, [e.target.value])
                      }
                      rows={3}
                      wrap="soft"
                      placeholder="Type your answer here..."
                    ></textarea>
                  )}

                  {annotation.type === "multiple choice" && (
                    <div className="flex flex-col">
                      {annotation.options?.map((option, index) => (
                        <label
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            name={annotation._id}
                            checked={annotation.answers?.[0] === option}
                            onChange={() =>
                              setConversation((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      annotations: prev.annotations?.map((a) =>
                                        a._id === annotation._id
                                          ? { ...a, answers: [option] }
                                          : a
                                      ),
                                    }
                                  : null
                              )
                            }
                            onBlur={() =>
                              handleSaveAnswer(annotation._id, [option])
                            }
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {annotation.type === "multiple answers" && (
                    <div className="flex flex-col">
                      {annotation.options?.map((option, index) => (
                        <label key={index} className="flex space-x-2">
                          <input
                            type="checkbox"
                            checked={annotation.answers?.includes(option)}
                            onChange={(e) =>
                              setConversation((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      annotations: prev.annotations?.map((a) =>
                                        a._id === annotation._id
                                          ? {
                                              ...a,
                                              answers: e.target.checked
                                                ? [...(a.answers || []), option]
                                                : (a.answers || []).filter(
                                                    (ans) => ans !== option
                                                  ),
                                            }
                                          : a
                                      ),
                                    }
                                  : null
                              )
                            }
                            onBlur={(e) =>
                              handleSaveAnswer(
                                annotation._id,
                                e.target.checked
                                  ? [...(annotation.answers || []), option]
                                  : (annotation.answers || []).filter(
                                      (ans) => ans !== option
                                    )
                              )
                            }
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {annotation.type === "scaler" && (
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        className="w-full accent-primary"
                        min={annotation.options?.[0] || "1"}
                        max={annotation.options?.[1] || "10"}
                        step={annotation.options?.[2] || "1"}
                        value={
                          annotation.answers?.[0] || annotation.options?.[0]
                        }
                        onChange={(e) =>
                          setConversation((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  annotations: prev.annotations?.map((a) =>
                                    a._id === annotation._id
                                      ? { ...a, answers: [e.target.value] }
                                      : a
                                  ),
                                }
                              : null
                          )
                        }
                        onBlur={(e) =>
                          handleSaveAnswer(annotation._id, [e.target.value])
                        }
                      />
                      <span className="text-foreground font-semibold">
                        {annotation.answers?.[0] || annotation.options?.[0]}
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Conversations</h1>
        {conversation.messages.map((message, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              message.role === "user"
                ? "bg-primary text-primary-foreground ml-auto"
                : "bg-muted text-muted-foreground mr-auto"
            }`}
          >
            <p
              className={`font-semibold ${
                message.role === "user" ? "text-muted" : "text-muted-foreground"
              }`}
            >
              {message.role === "user" ? "You" : "AI"}
            </p>
            <p className="mt-2 leading-relaxed">{message.content}</p>
            <button
              className="bg-yellow-200 rounded-md p-2 text-black mt-2 hover:bg-yellow-300 ease-in-out transition duration-300"
              onClick={() => {
                setActiveMessageIndex(
                  activeMessageIndex === index ? null : index
                );
                setMessageAnnotation(message.annotations || []);
              }}
            >
              {activeMessageIndex === index
                ? "Hide Annotations"
                : "Show Annotations"}
            </button>
            {activeMessageIndex === index && (
              <table className="w-full mt-2 border border-muted shadow-sm mb-3 text-foreground">
                <thead className="bg-secondary text-secondary-foreground">
                  <tr>
                    <th
                      className="border py-2 px-4 text-left"
                      style={{ width: "30%" }}
                    >
                      Title
                    </th>
                    <th
                      className="border py-2 px-4 text-left"
                      style={{ width: "60%" }}
                    >
                      Answer
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {messageAnnotation.map((annotation) => (
                    <tr key={annotation._id} className="even:bg-secondary">
                      <td className="py-2 px-4 border border-muted">
                        {annotation.title}
                      </td>
                      <td className="py-2 px-4 border border-muted">
                        {annotation.type === "textbox" && (
                          <textarea
                            className="w-full p-2 border border-muted rounded-md bg-card text-card-foreground resize-none"
                            value={annotation.answers?.[0] || ""}
                            onChange={(e) =>
                              setMessageAnnotation((prev) =>
                                prev.map((a) =>
                                  a._id === annotation._id
                                    ? { ...a, answers: [e.target.value] }
                                    : a
                                )
                              )
                            }
                            onBlur={(e) =>
                              handleSaveMessageAnnotation(annotation._id, [
                                e.target.value,
                              ])
                            }
                            rows={3}
                            wrap="soft"
                            placeholder="Type your answer here..."
                          ></textarea>
                        )}

                        {annotation.type === "multiple choice" && (
                          <div className="flex flex-col">
                            {annotation.options?.map((option, idx) => (
                              <label
                                key={idx}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="radio"
                                  name={annotation._id}
                                  checked={annotation.answers?.[0] === option}
                                  onChange={() =>
                                    setMessageAnnotation((prev) =>
                                      prev.map((a) =>
                                        a._id === annotation._id
                                          ? { ...a, answers: [option] }
                                          : a
                                      )
                                    )
                                  }
                                  onBlur={() =>
                                    handleSaveMessageAnnotation(
                                      annotation._id,
                                      [option]
                                    )
                                  }
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {annotation.type === "multiple answers" && (
                          <div className="flex flex-col">
                            {annotation.options?.map((option, idx) => (
                              <label key={idx} className="flex space-x-2">
                                <input
                                  type="checkbox"
                                  checked={annotation.answers?.includes(option)}
                                  onChange={(e) =>
                                    setMessageAnnotation((prev) =>
                                      prev.map((a) =>
                                        a._id === annotation._id
                                          ? {
                                              ...a,
                                              answers: e.target.checked
                                                ? [...(a.answers || []), option]
                                                : (a.answers || []).filter(
                                                    (ans) => ans !== option
                                                  ),
                                            }
                                          : a
                                      )
                                    )
                                  }
                                  onBlur={(e) =>
                                    handleSaveMessageAnnotation(
                                      annotation._id,
                                      e.target.checked
                                        ? [
                                            ...(annotation.answers || []),
                                            option,
                                          ]
                                        : (annotation.answers || []).filter(
                                            (ans) => ans !== option
                                          )
                                    )
                                  }
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {annotation.type === "scaler" && (
                          <div className="flex items-center space-x-4">
                            <input
                              type="range"
                              className="w-full accent-primary"
                              min={annotation.options?.[0] || "1"}
                              max={annotation.options?.[1] || "10"}
                              step={annotation.options?.[2] || "1"}
                              value={
                                annotation.answers?.[0] ||
                                annotation.options?.[0]
                              }
                              onChange={(e) =>
                                setMessageAnnotation((prev) =>
                                  prev.map((a) =>
                                    a._id === annotation._id
                                      ? { ...a, answers: [e.target.value] }
                                      : a
                                  )
                                )
                              }
                              onBlur={(e) =>
                                handleSaveMessageAnnotation(annotation._id, [
                                  e.target.value,
                                ])
                              }
                            />
                            <span className="text-foreground font-semibold">
                              {annotation.answers?.[0] ||
                                annotation.options?.[0]}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="mt-2">
              <h2 className="text-lg font-semibold text-foreground">
                Comments
              </h2>
              <h4>Refresh after each comments addition</h4>
              {message.comments?.map((comment) => (
                <div
                  key={comment._id}
                  className="flex items-center justify-between space-x-2 p-2 bg-gray-700 rounded-md mb-2"
                >
                  <div>
                    <p className="text-muted-foreground font-semibold">
                      {comment.name}
                    </p>
                    <p className="text-muted-foreground">{comment.content}</p>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-600 transition duration-300"
                    onClick={() => handleDeleteComment(index, comment._id)}
                  >
                    Delete
                  </button>
                </div>
              ))}

              <div className="flex items-center mt-4">
                <input
                  type="text"
                  className="w-full p-2 border border-muted rounded-l-md bg-card text-card-foreground focus:outline-none"
                  value={localCommentContent[index] || ""} // Local state per message
                  onChange={(e) =>
                    setLocalCommentContent((prev) => ({
                      ...prev,
                      [index]: e.target.value,
                    }))
                  }
                  placeholder="Type your comment here..."
                />
                <button
                  className="bg-blue-500 text-primary-foreground p-2 rounded-r-md hover:bg-primary-dark transition duration-300"
                  onClick={() => {
                    handleAddComment(index, localCommentContent[index] || "");
                    setLocalCommentContent((prev) => ({
                      ...prev,
                      [index]: "",
                    }));
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
