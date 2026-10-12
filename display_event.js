document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('events-container');

    try {
        const response = await fetch('http://localhost:3000/api/events');
        
        if (!response.ok) {
            throw new Error('Failed to fetch events from the server');
        }
        const events = await response.json();
        container.innerHTML = '';
        if (events.length === 0) {
            container.innerHTML = '<p>No upcoming events found</p>';
            return;
        }
        events.forEach((event, index) => {
            const eventNumber = index + 1;
            const formattedDate = new Date(event.EventDate).toLocaleDateString();
            let formattedTime = '';
            if (event.EventTime) {
                const timeString = String(event.EventTime);
                if (timeString.includes('T')) {
                    formattedTime = timeString.split('T')[1].substring(0, 5);
                } else {
                    formattedTime = timeString.substring(0, 5);
                }
            } else {
                formattedTime = 'N/A';
            }
            const eventCard = `
                <div class="event-card" data-event-id="${event.Id}" style="border: 1px solid #725e5e; padding: 15px; margin-bottom: 15px; border-radius: 5px;">
                    <div style="font-weight: bold; color: #ddd3d3; margin-bottom: 5px;">Event # ${eventNumber} of ${events.length}</div>
                    <h2>${event.EventName}</h2>
                    <div style="font-size: 20px; color: rgb(209, 131, 159);">
                        <p style="padding-top: 15px;"><strong>Hosted By:</strong> ${event.HostName}</p>
                        <p><strong>When:</strong> ${formattedDate} at ${formattedTime}</p>
                        <p><strong>Where:</strong> ${event.EventLocation}</p>
                        <p><strong>Description:</strong> ${event.EventDescription}</p>
                        <p><strong>Spots Available:</strong> ${event.SpotsAvailable ?? 30}</p>
                    </div>
                    <div style="margin-top: 10px;">
                        <button class="rsvp-button" style="background-color: #725e5e; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 5px;">RSVP</button>
                    </div>
                </div>
            `;
            container.innerHTML += eventCard;
        });
    } catch (error) {
        console.error('Network error:', error);
        container.innerHTML = '<p style="color: red;">Could not load events. Ensure the server is running</p>';
    }
});
document.addEventListener('click', async (e) => {
    
    if (e.target && e.target.classList.contains('rsvp-button')) {
        const card = e.target.closest('.event-card');
        const eventId = card.dataset.eventId;
        const eventName = card.querySelector('h2').innerText;

        document.getElementById('rsvp-modal').style.display = 'flex';
        document.getElementById('modal-event-id').value = eventId;
        document.getElementById('modal-event-title').innerText = `RSVP for: ${eventName}`;
    } 
    else if (e.target && (e.target.id === 'close-rsvp-btn' || e.target.classList.contains('close-modal'))) {
        closeRSVPModal();
    }
    
    else if (e.target && e.target.id === 'submit-rsvp-btn') {
        const eventId = document.getElementById('modal-event-id').value;
        const userName = document.getElementById('modal-user-name').value;
        const userEmail = document.getElementById('modal-user-email').value;

        if (!userName || !userEmail) {
            alert('Please fill out all fields!');
            return;
        }
        const registrationData = {
            eventId: parseInt(eventId),
            userName: userName,
            userEmail: userEmail
        };
        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                closeRSVPModal();
                window.location.reload();
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Could not connect to the server.');
        }
    }
});
function closeRSVPModal() {
    document.getElementById('rsvp-modal').style.display = 'none';
    document.getElementById('modal-user-name').value = '';
    document.getElementById('modal-user-email').value = '';
}
