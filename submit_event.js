document.getElementById('event-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const eventData = {
        eventName: document.getElementById('event-name').value,
        hostName: document.getElementById('event-host-name').value,
        eventDate: document.getElementById('event-date').value,
        eventTime: document.getElementById('event-time').value,
        eventLocation: document.getElementById('event-location').value,
        eventDescription: document.getElementById('event-description').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Event created successfully!');
            document.getElementById('event-form').reset();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Could not connect to the server.');
    }
});
