# ChatLogAnnotators

ChatLogAnnotators is a web application that allows users to upload a chatlog.json file and annotate it manually or via auto-generated annotations powered by a GPT model. It uses MongoDB as the NoSQL database, Next.js as its Frontend and Node.js as its Backend.

## Prerequisites

To develop or run this project on your local machine, ensure you have the following software installed:

1. Git (Install Git)
2. Node.js and npm (Install Node.js)

## Running the Project

### Next.js

To run the frontend, follow these steps:

1. Ensure Node.js and npm are installed on your machine. You can download and install them by searching Node.js in your browser

2. Navigate to the directory:

   ```sh
   cd chatlog-annotators
   ```

3. Install the dependencies:

   ```
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

This will start the frontend development server on `http://localhost:3000`.

### Annotation System Documentation

<p>The annotation system in this application is structured to facilitate flexible and dynamic annotation of conversations and messages. Below is a detailed explanation of its structure, types, and behavior.</p>

<h2>Annotation Structure</h2>
<p>Each annotation contains the following properties:</p>
<table>
  <thead>
    <tr>
      <th><strong>Property</strong></th>
      <th><strong>Description</strong></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>_id</code></td>
      <td>A unique identifier for the annotation.</td>
    </tr>
    <tr>
      <td><code>title</code></td>
      <td>The title or name of the annotation.</td>
    </tr>
    <tr>
      <td><code>type</code></td>
      <td>Specifies the type of annotation. Can be one of the following: Multiple Choice, Multiple Answers, Textbox, or Scaler.</td>
    </tr>
    <tr>
      <td><code>options</code></td>
      <td>Available choices for the annotation. Used for Multiple Choice and Multiple Answers types.</td>
    </tr>
    <tr>
      <td><code>answers</code></td>
      <td>The selected or provided answer(s) for the annotation.</td>
    </tr>
    <tr>
      <td><code>locality</code></td>
      <td>A boolean value indicating the scope of the annotation: <ul><li><code>true</code>: The annotation is specific to a message.</li><li><code>false</code>: The annotation applies to all messages in all conversations.</li></ul></td>
    </tr>
  </tbody>
</table>

<h2>Annotation Types</h2>
<ul>
  <li><strong>Multiple Choice</strong><p>Allows the user to select a single option from a predefined list.<br>Requires <code>options</code> to define the available choices.</p></li>
  <li><strong>Multiple Answers</strong><p>Allows the user to select multiple options from a predefined list.<br>Requires <code>options</code> to define the available choices.</p></li>
  <li><strong>Textbox</strong><p>Allows the user to input free text as an answer.<br>Does not require <code>options</code>.</p></li>
  <li><strong>Custom Scaler</strong><p>Provides a numeric range (e.g., slider) for the user to select a value.<br>Requires <code>options</code> to define the range (e.g., <code>[min, max, step]</code>).</p></li>
</ul>

<h2>Annotation Levels</h2>
<ul>
  <li><strong>Conversation Level Annotations</strong><p>Applied at the bottom of the entire conversation.<br>These annotations are not tied to any specific message but rather to the conversation as a whole.<br><code>locality</code> is set to <code>false</code>.</p></li>
  <li><strong>Message Level Annotations</strong><p>Applied to individual messages within a conversation.<br>These annotations are tied to the specific message they belong to.<br><code>locality</code> is set to <code>true</code> if it is only applied into one message, but it is set to be <code>false</code> if the message is set globally</p></li>
</ul>

<h2>Behavior of <code>locality</code></h2>
<ul>
  <li><code>true</code> (Message Level): The annotation is specific to a single message and will not affect other messages or the conversation as a whole.</li>
  <li><code>false</code> (Conversation Level): The annotation applies globally to all messages within all conversations.</li>
</ul>

```bash
{
	"_id" : ObjectId("67582288bb94b7f0585ccfcf"),
	"stime" : {
		"text" : "2024-03-13 17:34:30",
		"timestamp" : 1710322470.072647
	},
	"messages" : [
		{
			"role" : "user",
			"content" : "hello",
			"recorded_on" : {
				"text" : "2024-03-13 17:34:41",
				"timestamp" : 1710322481.39032
			},
			"token_cost" : {
				"cost" : "0.0",
				"tokens" : 0
			},
			"annotations" : [

			]
		},
		{
			"role" : "ai",
			"content" : "Hello! How can I assist you today? \n\n\n **Sources:** *['NTU Learn - Quiz Page', 'NTU Learn - Announcements Page']*",
			"recorded_on" : {
				"text" : "2024-03-13 17:34:48",
				"timestamp" : 1710322488.594567
			},
			"token_cost" : {
				"cost" : "0.00300750",
				"tokens" : 2002
			},
			"annotations" : [
			]
		},
		{
			"role" : "user",
			"content" : "when is the final quiz for 1015?",
			"recorded_on" : {
				"text" : "2024-03-13 17:35:00",
				"timestamp" : 1710322500.14842
			},
			"token_cost" : {
				"cost" : "0.0",
				"tokens" : 0
			},
			"annotations" : [

			]
		},
		{
			"role" : "ai",
			"content" : "There is no final quiz for SC1015/CE1115/CZ1115. However, there are two theory quizzes during the semester, one for Data Science (DS) and one for Artificial Intelligence (AI). The DS theory quiz will take place during the Recess Week on Friday, 8 March, and the AI theory quiz will take place during Week 14. The specific slots for the quizzes will be set closer to the dates, and the entire batch will take the quizzes on the same day to ensure fairness across the class. \n\n\n **Sources:** *['FAQs about the Course', 'NTU Learn - Quiz Page']*",
			"recorded_on" : {
				"text" : "2024-03-13 17:35:09",
				"timestamp" : 1710322509.418495
			},
			"token_cost" : {
				"cost" : "0.00420050",
				"tokens" : 2764
			},
			"annotations" : [

			]
		}
	],
	"last_interact" : {
		"text" : "2024-03-13 17:35:09",
		"timestamp" : 1710322509.418657
	},
	"llm_deployment_name" : "asknarelle-experimental-gpt-35-turbo",
	"llm_model_name" : "gpt-3.5-turbo-instruct",
	"vectorstore_index" : "vector-sc1015-ay23t2-b",
	"overall_cost" : {
		"overall_cost" : 0.007208000000000001,
		"overall_tokens" : 4766
	},
	"person" : "9503c7e66f97cb021f66cce6082b19bb",
	"annotations" : [

	]
}
```

After

```bash
{
	"_id" : ObjectId("67582288bb94b7f0585ccfcf"),
	"stime" : {
		"text" : "2024-03-13 17:34:30",
		"timestamp" : 1710322470.072647
	},
	"messages" : [
		{
			"role" : "user",
			"content" : "hello",
			"recorded_on" : {
				"text" : "2024-03-13 17:34:41",
				"timestamp" : 1710322481.39032
			},
			"token_cost" : {
				"cost" : "0.0",
				"tokens" : 0
			},
			"annotations" : [
				{
					"_id" : ObjectId("67777103bb08da1852fb8627"),
					"title" : "correct answer",
					"type" : "multiple choice",
					"options" : [
						"yes",
						"no",
						"can not be determined"
					],
					"answers" : [ ],
					"locality" : false
				},
				{
					"_id" : ObjectId("6777717dbb08da1852fb8628"),
					"title" : "remarks?",
					"type" : "textbox",
					"options" : [ ],
					"answers" : [ ],
					"locality" : true
				}
			]
		},
		{
			"role" : "ai",
			"content" : "Hello! How can I assist you today? \n\n\n **Sources:** *['NTU Learn - Quiz Page', 'NTU Learn - Announcements Page']*",
			"recorded_on" : {
				"text" : "2024-03-13 17:34:48",
				"timestamp" : 1710322488.594567
			},
			"token_cost" : {
				"cost" : "0.00300750",
				"tokens" : 2002
			},
			"annotations" : [
				{
					"_id" : ObjectId("67777103bb08da1852fb8627"),
					"title" : "correct answer",
					"type" : "multiple choice",
					"options" : [
						"yes",
						"no",
						"can not be determined"
					],
					"answers" : [ ],
					"locality" : false
				}
			]
		},
		{
			"role" : "user",
			"content" : "when is the final quiz for 1015?",
			"recorded_on" : {
				"text" : "2024-03-13 17:35:00",
				"timestamp" : 1710322500.14842
			},
			"token_cost" : {
				"cost" : "0.0",
				"tokens" : 0
			},
			"annotations" : [
				{
					"_id" : ObjectId("67777103bb08da1852fb8627"),
					"title" : "correct answer",
					"type" : "multiple choice",
					"options" : [
						"yes",
						"no",
						"can not be determined"
					],
					"answers" : [ ],
					"locality" : false
				}
			]
		},
		{
			"role" : "ai",
			"content" : "There is no final quiz for SC1015/CE1115/CZ1115. However, there are two theory quizzes during the semester, one for Data Science (DS) and one for Artificial Intelligence (AI). The DS theory quiz will take place during the Recess Week on Friday, 8 March, and the AI theory quiz will take place during Week 14. The specific slots for the quizzes will be set closer to the dates, and the entire batch will take the quizzes on the same day to ensure fairness across the class. \n\n\n **Sources:** *['FAQs about the Course', 'NTU Learn - Quiz Page']*",
			"recorded_on" : {
				"text" : "2024-03-13 17:35:09",
				"timestamp" : 1710322509.418495
			},
			"token_cost" : {
				"cost" : "0.00420050",
				"tokens" : 2764
			},
			"annotations" : [
				{
					"_id" : ObjectId("67777103bb08da1852fb8627"),
					"title" : "correct answer",
					"type" : "multiple choice",
					"options" : [
						"yes",
						"no",
						"can not be determined"
					],
					"answers" : [ ],
					"locality" : false
				}
			]
		}
	],
	"last_interact" : {
		"text" : "2024-03-13 17:35:09",
		"timestamp" : 1710322509.418657
	},
	"llm_deployment_name" : "asknarelle-experimental-gpt-35-turbo",
	"llm_model_name" : "gpt-3.5-turbo-instruct",
	"vectorstore_index" : "vector-sc1015-ay23t2-b",
	"overall_cost" : {
		"overall_cost" : 0.007208000000000001,
		"overall_tokens" : 4766
	},
	"person" : "9503c7e66f97cb021f66cce6082b19bb",
	"annotations" : [
		{
			"_id" : ObjectId("67766fda8e23d58c5919b982"),
			"title" : "Complexity of Query",
			"type" : "multiple choice",
			"options" : [
				"Trivial - Direct Answers",
				"Semi Trivial - Required some Explanation",
				"Non Trivial - Chatbot Unable to Answer",
				"Not Applicable"
			],
			"answers" : null,
			"locality" : false
		}
	]
}
```

<h2>Lib, types, and components</h2>

1. All of the sidebars components are resides in the components, some of them us using the shadcn-ui, and some of them are customized by the creators, such as cue-card, conversation-sidebar, etc.

2. Types will give you some interface that are used along the development, like the interface of annotations, interface of converssations, etc.

3. Lib is the helper that creators used to connect the project with the Database on Azure, which is here MongoDB on CosmosDB.

### Things to Improve

Eventhough, editors have used many components to be developed on, but on the admin and home page, there are still a lot of redundancy, such as Modals and Table, the next developers may give a look and make the code reusable in the future time.

Next is the loading state which sometimes for admin takes some time to update the annotation, especially on the global one, since we update it directly into the MongoDB.
