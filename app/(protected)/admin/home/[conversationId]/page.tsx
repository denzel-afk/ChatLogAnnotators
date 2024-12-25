"use client";

import { useEffect, useState } from "react";
import { Conversation } from "@/types/conversations";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

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
      .catch((err) => console.error("Error saving answer:", err));
  };

  if (error) {
    return <p className="text-red-500 p-4">{error}</p>;
  }

  if (!conversation) {
    return <p className="bg-black p-4 w-width">Loading conversation...</p>;
  }

  return (
    <div className="p-4">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Home: Annotate The Message
        </h1>
        <table className="w-full mt-2 border border-white shadow-sm mb-3 text-white">
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
            </tr>
          </thead>
          <tbody>
            {conversation.annotations?.map((annotation) => (
              <tr key={annotation._id}>
                <td className="py-2 px-4 border-white border">
                  {annotation.title}
                </td>
                <td className="py-2 px-4 border-white border">
                  {annotation.type === "textbox" && (
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md resize-none"
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
                    <div className="flex flex-col space x-4">
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
                        className="w-full"
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
                      <span className="text-white font-semibold">
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
