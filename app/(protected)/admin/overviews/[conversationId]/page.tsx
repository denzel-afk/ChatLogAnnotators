"use client";

import { ReactNode, useState, useEffect } from "react";
import { Conversation, Annotation, Message } from "@/types/conversations";
import { ActivitySquare } from "lucide-react";

export default function SummaryPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [activeMessageIndex, setActiveMessageIndex] = useState<number | null>(
    null
  );
  const [activeCommentIndex, setActiveCommentIndex] = useState<number | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params
      .then(({ conversationId }) => {
        fetch(`/api/conversations/${conversationId}`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch conversation");
            return res.json();
          })
          .then((data) => setConversation(data))
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

  if (error) {
    return <p className="text-red-500 p-4">{error}</p>;
  }

  if (!conversation) {
    return (
      <p className="bg-muted text-muted-foreground p-4 w-width">
        Loading conversation summary...
      </p>
    );
  }
  const renderSummary = (annotation: Annotation) => {
    switch (annotation.type) {
      case "multiple choice":
        const optionCounts = annotation.options?.map((option) => ({
          option,
          count:
            annotation.answers?.filter(
              (ans) => ans.content && ans.content.includes(option)
            ).length || 0,
        }));
        return (
          <table className="w-full border border-muted-foreground">
            <thead className="bg-secondary border-muted-foreground text-secondary-foreground">
              <tr>
                <th
                  className="border border-muted-foreground py-2 px-4"
                  style={{ width: "50%" }}
                >
                  Option
                </th>
                <th
                  className="border border-muted-foreground py-2 px-4"
                  style={{ width: "10%" }}
                >
                  Count
                </th>
                <th
                  className="border border-muted-foreground py-2 px-4"
                  style={{ width: "40%" }}
                >
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {optionCounts?.map(({ option, count }, index) => (
                <tr key={index}>
                  <td className="border border-muted-foreground py-2 px-4">
                    {option}
                  </td>
                  <td className="border border-muted-foreground py-2 px-4">
                    {count}
                  </td>
                  <td className="border border-muted-foreground py-2 px-4">
                    {annotation.answers
                      ?.filter(
                        (ans) => ans.content && ans.content.includes(option)
                      )
                      .map((ans, index) => (
                        <div key={index}>{ans.name}</div>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "multiple answers": {
        const optionCounts = annotation.options?.map((option) => ({
          option,
          count:
            annotation.answers?.filter(
              (ans) => ans.content && ans.content.includes(option)
            ).length || 0,
        }));
        return (
          <table className="w-full border border-muted-foreground">
            <thead className="bg-secondary text-secondary-foreground">
              <tr>
                <th
                  className="border border-muted-foreground py-2 px-4"
                  style={{ width: "50%" }}
                >
                  Option
                </th>
                <th
                  className="border border-muted-foreground py-2 px-4 text-center"
                  style={{ width: "10%" }}
                >
                  Count
                </th>
                <th
                  className="border border-muted-foreground  py-2 px-4"
                  style={{ width: "40%" }}
                >
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {optionCounts?.map(({ option, count }, index) => (
                <tr key={index}>
                  <td className="border border-muted-foreground py-2 px-4">
                    {option}
                  </td>
                  <td className="border border-muted-foreground py-2 px-4 text-center">
                    {count}
                  </td>
                  <td className="border border-muted-foreground py-2 px-4">
                    {annotation.answers
                      ?.filter(
                        (ans) => ans.content && ans.content.includes(option)
                      )
                      .map((ans) => ans.name)
                      .join(", ") || "No responses"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      case "scaler": {
        const values =
          annotation.answers?.map((ans) =>
            ans.content ? parseFloat(ans.content[0]) : NaN
          ) || [];
        const average =
          values.length > 0
            ? (
                values.reduce((sum, val) => sum + val, 0) / values.length
              ).toFixed(2)
            : "N/A";
        return (
          <table className="w-full border border-muted-foreground">
            <thead className="bg-secondary text-secondary-foreground">
              <tr>
                <th
                  className="border border-muted-foreground py-2 px-4"
                  style={{ width: "25%" }}
                >
                  Average
                </th>
                <th
                  className="border border-muted-foreground py-2 px-4"
                  style={{ width: "75%" }}
                >
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-muted-foreground py-2 px-4 text-center">
                  {average}
                </td>
                <td className="border border-muted-foreground py-2 px-4">
                  {annotation.answers
                    ?.map((ans) =>
                      ans.content
                        ? `${ans.name} (${ans.content[0]})`
                        : `${ans.name} (No content)`
                    )
                    .join(", ") || "No responses"}
                </td>
              </tr>
            </tbody>
          </table>
        );
      }
      case "textbox": {
        return (
          <table className="w-full border border-muted">
            <thead className="bg-secondary text-secondary-foreground">
              <tr>
                <th className="border border-muted-foreground py-2 px-4">
                  Response
                </th>
              </tr>
            </thead>
            <tbody>
              {annotation.answers?.map((ans, index) => (
                <tr key={index}>
                  <td className="border border-muted-foreground py-2 px-4">
                    {ans.content}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
    }
  };
  return (
    <div className="p-4 bg-background text-foreground h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">
        Summary of Annotations Conversation Level
      </h1>
      {conversation.annotations?.map((annotation, index) => (
        <div key={index} className="mb-4">
          <h2 className="text-lg font-semibold">{annotation.title}</h2>
          {renderSummary(annotation)}
        </div>
      ))}
      <h1 className="text-2xl font-bold mb-4">
        Summary of Annotations Message Level
      </h1>
      {conversation.messages.map((message, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg w-full mb-3 ${
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
            className="bg-yellow-200 rounded-md p-2 text-black mt-2 hover:bg-yellow-300 ease-in-out transition duration-300 mr-2"
            onClick={() => {
              setActiveMessageIndex(
                activeMessageIndex === index ? null : index
              );
            }}
          >
            {activeMessageIndex === index
              ? "Hide Annotations"
              : "Show Annotations"}
          </button>
          <button
            className="bg-yellow-200 rounded-md p-2 text-black mt-2 hover:bg-yellow-300 ease-in-out transition duration-300"
            onClick={() => {
              setActiveCommentIndex(
                activeCommentIndex === index ? null : index
              );
            }}
          >
            {activeCommentIndex === index ? "Hide Comments" : "Show Comments"}
          </button>
          {activeMessageIndex === index && (
            <div className="mt-2">
              {message.annotations?.map((annotation, index) => (
                <div key={index} className="mt-2">
                  <h3 className="text-lg font-semibold">{annotation.title}</h3>
                  {renderSummary(annotation)}
                </div>
              ))}
            </div>
          )}
          {activeCommentIndex === index && (
            <div className="mt-4 space-y-4">
              {message.comments?.map((comment, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {comment.name}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-800 dark:text-gray-200 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
