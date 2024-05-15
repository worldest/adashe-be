const { Expo } = require("expo-server-sdk");

const sendNotification = async (expoPushToken, data) => {
    const expo = new Expo({ accessToken: "ga8RJnNyZ9CqyRpXowyDUwx1zU9lYFklzDfL4iuV" });

    const chunks = expo.chunkPushNotifications([{ to: expoPushToken, ...data, priority: "high" }]);
    const tickets = [];

    for (const chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            // console.log(data)
            // console.log(expoPushToken, ticketChunk);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.error(error);
            // console.log(data)
        }
    }

    let response = "";

    for (const ticket of tickets) {
        if (ticket.status === "error") {
            if (ticket.details && ticket.details.error === "DeviceNotRegistered") {
                response = "DeviceNotRegistered";
            }
        }

        if (ticket.status === "ok") {
            response = ticket;
        }
    }
    console.log(response);
    
}

module.exports = sendNotification