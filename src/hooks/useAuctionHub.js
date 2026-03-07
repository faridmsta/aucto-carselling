import { useEffect, useState } from 'react';
import * as signalR from "@microsoft/signalr";

export const useAuctionHub = (auctionId) => {
    const [liveBid, setLiveBid] = useState(null);
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        // Hub bağlantısını qururuq
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("https://nihad911-001-site1.rtempurl.com/auctionHub") // Öz API URL-ni bura yaz
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection && auctionId) {
            connection.start()
                .then(() => {
                    // Otağa qoşuluruq
                    connection.invoke("JoinAuctionGroup", auctionId.toString());

                    // ReceiveNewBid eventini dinləyirik
                    connection.on("ReceiveNewBid", (bidderName, amount, newEndTime) => {
                        setLiveBid({ 
                            bidderName, 
                            amount, 
                            newEndTime, 
                            bidTime: new Date().toISOString() 
                        });
                    });
                })
                .catch(e => console.error('SignalR Error: ', e));

            return () => {
                // Səhifədən çıxanda qrupdan ayrılırıq
                connection.invoke("LeaveAuctionGroup", auctionId.toString());
                connection.stop();
            };
        }
    }, [connection, auctionId]);

    return { liveBid };
};