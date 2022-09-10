2. Get surveys information on the website 
 - Create a pop up notificacion stating we have new results 
 - Create interface 
    - Generate different section per question on the survey 


3. Create moderators to administrate a forum 
    - Forum does have:
        - Post
        - Comments 
        - Picture related with the person who is posting or commenting 
        - Likes 
        - Forum can accept pictures or videos if needed 
        - Allow or deny comments options 


      Moderators delete and Edit / AddForm needs to be created
      Add branch and shift to the student table (list)

(You must create the model before)
1. Fetch posts from firebase, using Firebase API (cloud firestore)
2. Map the fetched data into local models
3. Send the data to the view and render!

Local model
{
  "content": "",
  "userId": "",
  "createdAt": ""
  "picture": ""
}

Firebase Model ->
{
  "content": "1",
  "senderId": "",
  "timestamp": "",
  "userImage": ""
}

const snapshot = await collection('messages').get();
const data = snapshot.docs.map(doc => doc.data());
const messages = data.map(doc => {
  return {
    content: doc.content,
    userId: doc.userId,
    createdAt: doc.timestamp,
    picture: doc.userImage
  }
});

return messages;
----- VIEW
const user = // retrieve from cookies
return res.render('posts', { user, messages });
        
{
  "Main Title": string,
  "id": string,
  "questions": 
  [{
    "title": string,
    "options": 
    [{
      "answer": string,
      "id": string,
    }]
  }]
}