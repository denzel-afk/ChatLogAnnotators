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
   cd ChatLogAnnotators
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

<p>There are 3 important collections in the main databases that we will develop and using here, they are</p> `chatlog` which is conatinaing all of the conversations and messages in one database, and later the URI, etc, that will be loaded to the app are taken from this collection, then `databases`, this collection is for storing all of the URI, database_name, collection_name, etc for the database swtiching across the application. last but not least, `users`, this collection is for stroing the data of each annotator, such as the allocated database, and username for logging in into the application.

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
  <li><strong>Conversation Level Annotations</strong><p>Applied at the bottom of the entire conversation.<br>These annotations are not tied to any specific message but rather to the conversation as a whole.</p></li>
  <li><strong>Message Level Annotations</strong><p>Applied to individual messages within a conversation.<br>These annotations are tied to the specific message they belong to and also applied to all messages in all conversations. With an addition comments, these comments are individual annotations that might be important outside the given annotation from admin context</p></li>
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
	"_id" : ObjectId("67582286bb94b7f0585ccfca"),
	"stime" : {
		"text" : "2024-03-13 17:33:28",
		"timestamp" : 1710322408.501202
	},
	"messages" : [
		{
			"role" : "user",
			"content" : "is there lab next week?",
			"recorded_on" : {
				"text" : "2024-03-13 17:33:56",
				"timestamp" : 1710322436.547978
			},
			"token_cost" : {
				"cost" : "0.0",
				"tokens" : 0
			},
			"annotations" : [
				{
					"_id" : ObjectId("6777b2f405d56be354219425"),
					"title" : "Query Sentiments",
					"type" : "multiple choice",
					"options" : [
						"Positive",
						"Negative",
						"Neutral",
						"Not Applicable (AI Messages)"
					],
					"answers" : [
						{
							"_id" : ObjectId("677ade2aaef008c94d391940"),
							"name" : "ongchinann",
							"timestamp" : 1736105514372,
							"content" : [
								"Negative"
							]
						},
						{
							"_id" : ObjectId("677ae4eaaef008c94d39194d"),
							"name" : "michael",
							"timestamp" : 1736107242405,
							"content" : [
								"Neutral"
							]
						},
						{
							"_id" : ObjectId("677ae52daef008c94d391950"),
							"name" : "michelle",
							"timestamp" : 1736107309329,
							"content" : [
								"Not Applicable (AI Messages)"
							]
						}
					]
				}
			],
			"comments" : [
				{
					"_id" : ObjectId("6778204805d56be354219436"),
					"name" : "ongchinann",
					"timestamp" : 1735925830934,
					"content" : "comment1-ong"
				},
				{
					"_id" : ObjectId("6778209305d56be354219438"),
					"name" : "michael",
					"timestamp" : 1735925906087,
					"content" : "comment1-michael"
				},
				{
					"_id" : ObjectId("67835e981069eeae0ca36b0d"),
					"name" : "michael",
					"timestamp" : 1736662677416,
					"content" : "comment2-michael"
				}
			]
		},
		{
			"role" : "ai",
			"content" : "There will be no lab session next week as it is Recess Week. \n\n\n **Sources:** *['FAQs about the Course', 'Course Calendar', 'NTU Learn - Announcements Page']*",
			"recorded_on" : {
				"text" : "2024-03-13 17:34:03",
				"timestamp" : 1710322443.800639
			},
			"token_cost" : {
				"cost" : "0.00392550",
				"tokens" : 2612
			},
			"annotations" : [
				{
					"_id" : ObjectId("6777b2f405d56be354219425"),
					"title" : "Query Sentiments",
					"type" : "multiple choice",
					"options" : [
						"Positive",
						"Negative",
						"Neutral",
						"Not Applicable (AI Messages)"
					],
					"answers" : [
						{
							"_id" : ObjectId("677d6c96fa6b9912e0a730e0"),
							"name" : "ongchinann",
							"timestamp" : 1736273046738,
							"content" : [
								"Positive"
							]
						}
					]
				}
			],
			"comments" : [ ]
		},
		{
			"role" : "user",
			"content" : "what week is it now",
			"recorded_on" : {
				"text" : "2024-03-13 17:34:21",
				"timestamp" : 1710322461.171272
			},
			"token_cost" : {
				"cost" : "0.0",
				"tokens" : 0
			},
			"annotations" : [
				{
					"_id" : ObjectId("6777b2f405d56be354219425"),
					"title" : "Query Sentiments",
					"type" : "multiple choice",
					"options" : [
						"Positive",
						"Negative",
						"Neutral",
						"Not Applicable (AI Messages)"
					],
					"answers" : [
						{
							"_id" : ObjectId("6790cb7eeb531f02c0069aa8"),
							"name" : "ongchinann",
							"timestamp" : 1737542526893,
							"content" : [
								"Negative"
							]
						}
					]
				}
			]
		},
		{
			"role" : "ai",
			"content" : "I'm sorry, I don't have access to real-time information. Could you please check the course calendar or NTULearn to confirm which week it is currently? ",
			"recorded_on" : {
				"text" : "2024-03-13 17:34:25",
				"timestamp" : 1710322465.632266
			},
			"token_cost" : {
				"cost" : "0.00417000",
				"tokens" : 2769
			},
			"annotations" : [
				{
					"_id" : ObjectId("6777b2f405d56be354219425"),
					"title" : "Query Sentiments",
					"type" : "multiple choice",
					"options" : [
						"Positive",
						"Negative",
						"Neutral",
						"Not Applicable (AI Messages)"
					],
					"answers" : [ ]
				}
			]
		},
		{
			"role" : "user",
			"content" : "what is the deadline for my assignment",
			"recorded_on" : {
				"text" : "2024-03-13 17:34:54",
				"timestamp" : 1710322494.562975
			},
			"token_cost" : {
				"cost" : "0.0",
				"tokens" : 0
			},
			"annotations" : [
				{
					"_id" : ObjectId("6777b2f405d56be354219425"),
					"title" : "Query Sentiments",
					"type" : "multiple choice",
					"options" : [
						"Positive",
						"Negative",
						"Neutral",
						"Not Applicable (AI Messages)"
					],
					"answers" : [ ]
				}
			]
		},
		{
			"role" : "ai",
			"content" : "I'm sorry, I don't have access to real-time information about your specific assignment deadline. Please check the assignment details and instructions provided by your instructor on NTULearn or in class to confirm the deadline. If you are unable to find the deadline, you can email your instructor for clarification. ",
			"recorded_on" : {
				"text" : "2024-03-13 17:35:05",
				"timestamp" : 1710322505.071112
			},
			"token_cost" : {
				"cost" : "0.00403300",
				"tokens" : 2669
			},
			"annotations" : [
				{
					"_id" : ObjectId("6777b2f405d56be354219425"),
					"title" : "Query Sentiments",
					"type" : "multiple choice",
					"options" : [
						"Positive",
						"Negative",
						"Neutral",
						"Not Applicable (AI Messages)"
					],
					"answers" : [ ]
				}
			]
		},
		{
			"role" : "user",
			"content" : "what is the deadline for my assignment",
			"recorded_on" : {
				"text" : "2024-03-13 17:35:12",
				"timestamp" : 1710322512.711009
			},
			"token_cost" : {
				"cost" : "0.0",
				"tokens" : 0
			},
			"annotations" : [
				{
					"_id" : ObjectId("6777b2f405d56be354219425"),
					"title" : "Query Sentiments",
					"type" : "multiple choice",
					"options" : [
						"Positive",
						"Negative",
						"Neutral",
						"Not Applicable (AI Messages)"
					],
					"answers" : [ ]
				}
			]
		},
		{
			"role" : "ai",
			"content" : "I'm sorry, I don't have access to real-time information about your specific assignment deadline. Please check the assignment details and instructions provided by your instructor on NTULearn or in class to confirm the deadline. If you are unable to find the deadline, you can email your instructor for clarification. ",
			"recorded_on" : {
				"text" : "2024-03-13 17:35:18",
				"timestamp" : 1710322518.225166
			},
			"token_cost" : {
				"cost" : "0.00414700",
				"tokens" : 2745
			},
			"annotations" : [
				{
					"_id" : ObjectId("6777b2f405d56be354219425"),
					"title" : "Query Sentiments",
					"type" : "multiple choice",
					"options" : [
						"Positive",
						"Negative",
						"Neutral",
						"Not Applicable (AI Messages)"
					],
					"answers" : [ ]
				}
			]
		}
	],
	"last_interact" : {
		"text" : "2024-03-13 17:35:18",
		"timestamp" : 1710322518.225371
	},
	"llm_deployment_name" : "asknarelle-experimental-gpt-35-turbo",
	"llm_model_name" : "gpt-3.5-turbo-instruct",
	"vectorstore_index" : "vector-sc1015-ay23t2-b",
	"overall_cost" : {
		"overall_cost" : 0.0162755,
		"overall_tokens" : 10795
	},
	"person" : "44793f1faad064b52f6716c2c4b0633e",
	"annotations" : [
		{
			"_id" : ObjectId("677a5672f6237996222be039"),
			"title" : "textboxt-test",
			"type" : "scaler",
			"options" : [
				"3",
				"10",
				"1"
			],
			"answers" : [
				{
					"_id" : ObjectId("677acdffaef008c94d39193f"),
					"name" : "ongchinann",
					"timestamp" : 1736101375025,
					"content" : [
						"8"
					]
				},
				{
					"_id" : ObjectId("677ae24aaef008c94d391945"),
					"name" : "michael",
					"timestamp" : 1736106570699,
					"content" : [
						"6"
					]
				},
				{
					"_id" : ObjectId("677ae47faef008c94d391948"),
					"name" : "michelle",
					"timestamp" : 1736107135172,
					"content" : [
						"8"
					]
				},
				{
					"_id" : ObjectId("67849fd00c02a682ab320fa2"),
					"name" : "denzel",
					"timestamp" : 1736744912560,
					"content" : [
						"6"
					]
				}
			]
		},
		{
			"_id" : ObjectId("677ae136aef008c94d391942"),
			"title" : "textarea",
			"type" : "textbox",
			"options" : [ ],
			"answers" : [
				{
					"_id" : ObjectId("677ae19faef008c94d391943"),
					"name" : "ongchinann",
					"timestamp" : 1736106399902,
					"content" : [
						"haloooo"
					]
				},
				{
					"_id" : ObjectId("677ae247aef008c94d391944"),
					"name" : "michael",
					"timestamp" : 1736106567675,
					"content" : [
						"hola otodos"
					]
				},
				{
					"_id" : ObjectId("677ae485aef008c94d39194b"),
					"name" : "michelle",
					"timestamp" : 1736107141536,
					"content" : [
						"no info"
					]
				},
				{
					"_id" : ObjectId("67849fde0c02a682ab320fa4"),
					"name" : "denzel",
					"timestamp" : 1736744926793,
					"content" : [
						"nullity"
					]
				}
			]
		},
		{
			"_id" : ObjectId("678117f4e7951c23b955ab3e"),
			"title" : "Intents of Query",
			"type" : "multiple answers",
			"options" : [
				"Course Admin",
				"Mini-Projects",
				"Quizzes"
			],
			"answers" : [
				{
					"_id" : ObjectId("678118a4e7951c23b955ab40"),
					"name" : "ongchinann",
					"timestamp" : 1736513700260,
					"content" : [
						"Mini-Projects",
						"Course Admin"
					]
				},
				{
					"_id" : ObjectId("67835e871069eeae0ca36b0c"),
					"name" : "michael",
					"timestamp" : 1736662663138,
					"content" : [
						"Mini-Projects",
						"Quizzes"
					]
				},
				{
					"_id" : ObjectId("67849fd40c02a682ab320fa3"),
					"name" : "denzel",
					"timestamp" : 1736744916131,
					"content" : [
						"Mini-Projects",
						"Quizzes"
					]
				}
			]
		},
		{
			"_id" : ObjectId("6784a6580c02a682ab320fac"),
			"title" : "Complexity of Query",
			"type" : "multiple choice",
			"options" : [
				"Trivial - Direct Answer",
				"Semi-Trivial - Required some Explanation",
				"Non Trivial - Chatbot Unable to Answer",
				"Not Applicable"
			],
			"answers" : [
				{
					"_id" : ObjectId("6784a6b10c02a682ab320fad"),
					"name" : "ongchinann",
					"timestamp" : 1736746673319,
					"content" : [
						"Trivial - Direct Answer"
					]
				}
			]
		}
	]
}
```

sample of databases collection (I close with asterisk, so it is more confidential)

```
{
	"_id" : ObjectId("6780cb42491229adcde7c1f2"),
	"uri" : "mongodb://denzel-chatlogdb:OnnMNnOppPFbft5aviYZxvkq6D3j71**********KZuOUBh***************fdlckg==@denzel-chatlogdb.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@denzel-chatlogdb@",
	"databaseId" : "chatlog_db",
	"containerId" : "chatlog_collection",
	"name" : "Default Database",
	"createdAt" : {
		"$date" : 1736493890580
	}
}

```

sample of users collection

```
{
	"_id" : ObjectId("676184792c3b0c10bc7df637"),
	"username" : "*****",
	"role" : "annotator",
	"assignedConversations" : {
		"6780cb42491229adcde7c1f2" : {
			"teamId" : "manual_team_1737073716561",
			"conversations" : [
				"6758228ebb94b7f0585cd278",
				"6758228bbb94b7f0585cd178"
			]
		},
		"6780d2f8491229adcde7c1f4" : {
			"teamId" : "manual_team_1737073945849",
			"conversations" : [
				"65f17329192f78bab2a94545",
				"65f1732e192f78bab2a94547",
				"65f17338192f78bab2a9454b",
				"65f17422192f78bab2a94567"
			]
		}
	}
}
```

<h2>Lib, types, and components</h2>

1. All of the sidebars components are resides in the components, some of them us using the shadcn-ui, and some of them are customized by the creators, such as cue-card, conversation-sidebar, etc.

2. Types will give you some interface that are used along the development, like the interface of annotations, interface of converssations, etc.

3. Lib is the helper that creators used to connect the project with the Database on Azure, which is here MongoDB on CosmosDB.

### Things to Improve

Eventhough, editors have used many components to be developed on, but on the admin and home page, there are still a lot of redundancy, such as Modals and Table, the next developers may consider to make the table and the modal to be a component, and make it more modular.

Next is the loading state which sometimes for admin takes some time to update the annotation, especially on the global one, since we update all of the datas inside the MongoDB directly, that is why the writing state takes a lot of time.

For admin page, if you want a better User Interface or maybe an even better UX, you can also take a look, right now the implmenetation for the task division is I only gave the threshold for the number of conversations intersections, then it will be auto divided, while for the manual one, you need to know the ObjectId of the converstaion and you can assign it after that.

### Deployment Process

We will try to guide you to deploy via Ms. Azure and through GitHub Actions for the deployment.

1. First step you need to have an account in the Ms. Azure, and you can choose the App Service to deploy this app into. Click the Web App only

2. Then, you need to Choose your subscription, if you are NTU student you can choose Azure for Students, and do not forget to choose your own region (for us, it will be Southeast Asia), for publish part choose code

3. For the pricing plan, please choose B1 or better, since we are going to hold a big database here.

4. After being finished, it is the time to insert your environment variable under the settings, you need to fill in

```
DEFAULT_COSMOSDB_ENDPOINT =
DEFAULT_COSMOSDB_DATABASE =
DEFAULT_COSMOSDB_CONTAINER =
DEFAULT_COSMOSDB_USER_COLLECTION =
DEFAULT_COSMOSDB_DATABASE_COLLECTION =
DEFAULT_DATABASE_NAME =

```

This will be the initial database before you switch to another databse inside the pp, but for the user_collection and database_collection, they are actually just need to be saved inside one database only, since they are made just to save the user name, and also the database endpoint. So, yes you just need to make that database collection inside your default database.

5. Finally on the github, you can actually use my github to use github actions for the deployment, and all of the secrets, you can change it into those that you add into your environment variable, so if you want to make it by yourself, you just need to add this script inside your working space, and push itu onyour github.

```
name: Build and deploy Node.js app to Azure Web App - `your-azure-app-service-name`

on:
  push:
    branches:
      - `your-branch (mine is nodjango2)`
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js version
        uses: actions/setup-node@v3
        with:
          node-version: "20.x"

      - name: Install dependencies and build
        env:
          DEFAULT_COSMOSDB_ENDPOINT: ${{ secrets.DEFAULT_COSMOSDB_ENDPOINT }}
          DEFAULT_COSMOSDB_DATABASE: ${{ secrets.DEFAULT_COSMOSDB_DATABASE }}
          DEFAULT_COSMOSDB_CONTAINER: ${{ secrets.DEFAULT_COSMOSDB_CONTAINER }}
          DEFAULT_COSMOSDB_USER_COLLECTION: ${{ secrets.DEFAULT_COSMOSDB_USER_COLLECTION }}
          DEFAULT_COSMOSDB_DATABASE_COLLECTION: ${{ secrets.DEFAULT_COSMOSDB_DATABASE_COLLECTION }}
          DEFAULT_DATABASE_NAME: ${{ secrets.DEFAULT_DATABASE_NAME }}
        run: |
          npm install
          npm run build --if-present
          npm run test --if-present

      - name: Validate build artifacts
        run: |
          if [ ! -d "dist" ] && [ ! -f "package.json" ]; then
            echo "Build artifacts missing"
            exit 1
          fi

      - name: Zip artifact for deployment
        run: zip -r release.zip ./ -x node_modules\* \*.git\* \*test\* \*coverage\*

      - name: Upload artifact for deployment job
        uses: actions/upload-artifact@v4
        with:
          name: node-app
          path: release.zip

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: "Production"

    steps:
      - name: Download artifact from build job
        uses: actions/download-artifact@v4
        with:
          name: node-app

      - name: Unzip artifact for deployment
        run: unzip release.zip -d ./release

      - name: Deploy to Azure Web App
        id: deploy-to-webapp
        uses: azure/webapps-deploy@v3
        with:
          app-name: "your-azure-app-service-name"
          slot-name: "Production"
          package: ./release
          publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE_A0843A38014646E88DB185863F0E64D3 }}

      - name: Verify deployment
        run: |
          echo "Deployment completed. Access your application at:"
          echo ${{ steps.deploy-to-webapp.outputs.webapp-url }}

```

and do not forget to fill in the secrets on the github settings before you push it on your github again.

That will be it for the deployment settings. If you have any enquiries, please contact `denzeledanbanget@gmail.com` as the email of the first developer.
