document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    document.querySelector("#compose-form").addEventListener("submit", sendMail);


  // By default, load the inbox
    load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#single-emails-view').style.display = 'none';

  // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
    
  // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#single-emails-view').style.display = 'none';

  // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    // Second Task
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        console.log(emails);
        emails.forEach(item => {
            const element = document.createElement('div');
            element.innerHTML = `
                <p>${item.sender}</p>
                <p>${item.subject}</p>
                <p>${item.timestamp}</p>
            `;
            
            if (item.read) {
                element.className = "read-item";
            } else {
                element.className = "unread-item";
            }

            document.querySelector('#emails-view').append(element);
            element.addEventListener('click', () => viewMail(item.id, mailbox));
        });
    });
}



// First task
function sendMail(e){
    e.preventDefault();
    let recipients = document.querySelector('#compose-recipients').value;
    let subject = document.querySelector('#compose-subject').value;
    let body = document.querySelector('#compose-body').value;

    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: recipients,
            subject: subject,
            body: body
        })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
        load_mailbox('sent');
    });
}



function viewMail(id, mailbox) {
    // Third task
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(item => {
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'none';
        document.querySelector('#single-emails-view').style.display = 'block';
        document.querySelector('#single-emails-view').innerHTML = `
            <p>From: ${item.sender}</p>
            <p>To: ${item.recipients}</p>
            <p>Subject: ${item.subject}</p>
            <p>Time: ${item.timestamp}</p>
            <hr>
            <p>${item.body}</p>
        `;

        if(!item.read){
            fetch(`emails/${item.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    read: true
                })
            });
        }

        // Fourth task
        const btnArc = document.createElement('button');
        if (item.archived) {
            btnArc.innerHTML = "Unarchive";
        } else {
            btnArc.innerHTML = "Archive";
        }
        btnArc.className = "btn btn-primary";
        btnArc.addEventListener('click', function(){
            fetch(`emails/${item.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: !item.archived
                })
            })
            .then(() => load_mailbox('inbox'));
        });
        if (mailbox == 'inbox' || mailbox == 'archive'){
            document.querySelector('#single-emails-view').append(btnArc);
        }

        // Fifth Task
        const btnRep = document.createElement('button');
        btnRep.innerHTML = "Reply";
        btnRep.className = "btn btn-primary ml-2";
        btnRep.addEventListener('click', function(){
            compose_email();
            document.querySelector('#compose-recipients').value = item.sender;
            let subj = item.subject;
            if(subj.split(' ', 1)[0] != "Re:"){
                subj = "Re: " + item.subject;
            }
            document.querySelector('#compose-subject').value = subj;
            document.querySelector('#compose-body').value = `On ${item.timestamp} ${item.sender} wrote: ${item.body}`;
        });
        document.querySelector('#single-emails-view').append(btnRep);
    });
}