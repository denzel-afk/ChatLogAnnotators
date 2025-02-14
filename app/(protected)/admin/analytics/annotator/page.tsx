"use client";

import React, { useEffect, useState } from "react";
import { useDatabase } from "@/components/context/database-context";
import { toast } from "react-toastify";
import {
  Database,
  User,
  Conversation,
  Annotation,
} from "@/types/conversations";
import ExpandableCard from "@/components/chart/expandable-card";
import AnnotationDistributedChart from "@/components/chart/annotated-distribution";
import AnnotatedLabelDistributionChart from "@/components/chart/label-annotated-distribution";
import {
  AnnotatedDistributionData,
  AnnotatedLabelAnnotationData,
} from "@/types/chart";

const AnalyticsAnnotatorsPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [annotationData, setAnnotationData] = useState<
    AnnotatedDistributionData[]
  >([]);
  const [labelData, setLabelData] = useState<AnnotatedLabelAnnotationData[]>(
    []
  );
  const summary = `Total Annotators: ${users.length}`;
  const details = users
    .map((user) => `${user.username} (${user.role})`)
    .join(", ");
  const { activeDatabase } = useDatabase();

  useEffect(() => {
    async function fetchUsersAndConversations() {
      const loadingToastId = toast.loading("Loading conversation summary...");
      const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("username="))
        ?.split("=")[1];
      const username = cookieValue
        ? decodeURIComponent(cookieValue)
        : "Anonymous";
      if (!activeDatabase) {
        console.error("Active database is not set.");
        toast.update(loadingToastId, {
          render: "Active database is not set.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
        return;
      }
      try {
        const response = await fetch("/api/users");
        const allUsers = await response.json();
        const activeDatabaseName = activeDatabase.name;
        const response2 = await fetch("/api/admin/databases");
        const databases = await response2.json();
        const activeDatabaseId = databases.find(
          (db: Database) => db.name === activeDatabaseName
        )._id;
        const dbId = activeDatabaseId.toString();

        if (response.ok) {
          const filteredUsers = allUsers.filter(
            (user: User) =>
              (user.assignedConversations &&
                user.assignedConversations[dbId]) ||
              user.role === "admin"
          );
          setUsers(filteredUsers);

          const conversationsResponse = await fetch(
            `/api/conversations?username=${username}&name=${activeDatabase.name}`
          );
          const allConversations = await conversationsResponse.json();

          const annotationStatus = filteredUsers.map((user: User) => {
            let assignedConversations: string[] = [];

            if (user.role === "annotator") {
              assignedConversations =
                user.assignedConversations?.[dbId]?.assignments.flatMap(
                  (assignment) => assignment.conversations
                ) || [];
            }

            if (user.role === "admin") {
              assignedConversations = allConversations.map(
                (conversation: Conversation) => conversation._id
              );
            }

            const statusCount = {
              username: user.username,
              annotated: 0,
              inProgress: 0,
              notAnnotated: 0,
            };

            allConversations.forEach((conversation: Conversation) => {
              if (assignedConversations.includes(conversation._id)) {
                const allAnnotated =
                  conversation.messages.every((message) =>
                    message.annotations
                      ? message.annotations.every(
                          (annotation) =>
                            annotation.answers && annotation.answers.length > 0
                        )
                      : true
                  ) &&
                  (conversation.annotations
                    ? conversation.annotations.every(
                        (annotation) =>
                          annotation.answers && annotation.answers.length > 0
                      )
                    : true);
                const inProgress =
                  (conversation.annotations?.some(
                    (annotation) =>
                      annotation.answers && annotation.answers.length > 0
                  ) ||
                    conversation.messages.some((message) =>
                      message.annotations?.some(
                        (annotation) =>
                          annotation.answers && annotation.answers.length > 0
                      )
                    )) &&
                  !allAnnotated;
                if (allAnnotated) {
                  statusCount.annotated++;
                } else if (inProgress) {
                  statusCount.inProgress++;
                } else {
                  statusCount.notAnnotated++;
                }
              }
            });

            return statusCount;
          });

          setAnnotationData(annotationStatus);

          const labelMap: {
            [key: string]: { annotated: number; notAnnotated: number };
          } = {};

          // Calculate annotated and notAnnotated for each conversation
          filteredUsers.forEach((user: User) => {
            let assignedConversations: string[] = [];

            if (user.role === "annotator") {
              assignedConversations =
                user.assignedConversations?.[dbId]?.assignments.flatMap(
                  (assignment) => assignment.conversations
                ) || [];
            }

            if (user.role === "admin") {
              assignedConversations = allConversations.map(
                (conversation: Conversation) => conversation._id
              );
            }

            assignedConversations.forEach((conversationId) => {
              const conversation = allConversations.find(
                (conv: Conversation) => conv._id === conversationId
              );

              if (conversation) {
                conversation.annotations?.forEach((annotation: Annotation) => {
                  const label = annotation.title;
                  if (!labelMap[label]) {
                    labelMap[label] = { annotated: 0, notAnnotated: 0 };
                  }

                  annotation.answers?.forEach(() => {
                    labelMap[label].annotated++;
                  });
                });
              }
            });
          });

          // Calculate notAnnotated
          filteredUsers.forEach((user: User) => {
            let assignedConversations: string[] = [];

            if (user.role === "annotator") {
              assignedConversations =
                user.assignedConversations?.[dbId]?.assignments.flatMap(
                  (assignment) => assignment.conversations
                ) || [];
            }

            if (user.role === "admin") {
              assignedConversations = allConversations.map(
                (conversation: Conversation) => conversation._id
              );
            }

            assignedConversations.forEach((conversationId) => {
              const conversation = allConversations.find(
                (conv: Conversation) => conv._id === conversationId
              );

              if (conversation) {
                conversation.annotations?.forEach((annotation: Annotation) => {
                  const label = annotation.title;
                  if (!labelMap[label]) {
                    labelMap[label] = { annotated: 0, notAnnotated: 0 };
                  }

                  const isAnnotated =
                    annotation.answers && annotation.answers.length > 0;

                  if (!isAnnotated) {
                    labelMap[label].notAnnotated++;
                  }
                });
              }
            });
          });

          const labelData = Object.keys(labelMap).map((label) => ({
            label,
            numsAnnotated: labelMap[label].annotated,
            numsNotAnnotated: labelMap[label].notAnnotated,
          }));

          setLabelData(labelData);

          toast.update(loadingToastId, {
            render: "Conversation summary loaded successfully!",
            type: "success",
            isLoading: false,
            autoClose: 5000,
          });
        } else {
          toast.update(loadingToastId, {
            render: "Failed to fetch users.",
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
        }
      } catch (error) {
        console.error("Error fetching users or conversations:", error);
        toast.update(loadingToastId, {
          render: "Error fetching users or conversations.",
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    }

    fetchUsersAndConversations();
  }, [activeDatabase]);

  return (
    <div>
      <div className="flex justify-center items-center">
        <ExpandableCard summary={summary} details={details} />
      </div>
      <div className="flex justify-center items-center">
        <AnnotatedLabelDistributionChart data={labelData} />
      </div>
      <div className="flex justify-center items-center">
        <AnnotationDistributedChart data={annotationData} />
      </div>
    </div>
  );
};

export default AnalyticsAnnotatorsPage;
