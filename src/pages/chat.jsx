import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

let socket;

const Chat = () => {
    const [user, setUser] = useState(localStorage.getItem('name'));
    const [employeeId, setEmployeeId] = useState(localStorage.getItem('id'));
    const [users, setUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const socketUrl = 'https://chat-2-1dgm.onrender.com';
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null); // Store the selected employeeId

    const messageEndRef = useRef(null); // Ref for scrolling to the bottom

    const handleCardClick = (employeeId) => {
        setSelectedEmployeeId(employeeId); // Update the selected employeeId
    };

    const getMessages = async () => {
        if (!selectedEmployeeId) return;
        try {
            const response = await axios.get(`https://chat-2-1dgm.onrender.com/getMessages`, {
                params: { sender: employeeId, receiver: selectedEmployeeId }
            });
            setMessages(response.data.messages); // Set the fetched messages
        } catch (err) {
            console.error(err);
        }
    };

    const getUser = async () => {
        try {
            const response = await axios.get('https://chat-2-1dgm.onrender.com/users');
            const filteredData = response.data.filter(item => item.username !== user);
            setUsers(filteredData); // Filter out the current user from the list
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    useEffect(() => {
        getMessages();
    }, [selectedEmployeeId]); // Fetch messages when selectedEmployeeId changes

    useEffect(() => {
        socket = io(socketUrl);

        // Join the employeeId when the user connects
        socket.emit('join', { user, employeeId }, (err) => {
            if (err) {
                console.error(err);
            }
        });

        return () => {
            socket.disconnect();
            socket.off();
        };
    }, [socketUrl, user, employeeId]);

    useEffect(() => {
        socket.on('message', (msg) => {
            // Only update messages if they belong to the selected conversation
            if (
                (msg.sender === employeeId && msg.receiver === selectedEmployeeId) ||
                (msg.sender === selectedEmployeeId && msg.receiver === employeeId)
            ) {
                setMessages((prevMsg) => [...prevMsg, msg]); // Append new message
            }

            // Scroll to the bottom when a new message arrives
            if (messageEndRef.current) {
                messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        });

        socket.on('roomMembers', (usrs) => {
            setOnlineUsers(usrs);
        });
    }, [employeeId, selectedEmployeeId]);

    const sendMessage = () => {
        if (message.trim() && selectedEmployeeId) {
            // Emit message to the receiver and the sender
            socket.emit('sendMessage', employeeId, message, selectedEmployeeId, () => setMessage(''));
        }
    };
    console.log(onlineUsers);
    

    const filteredMessages = messages?.filter(msg =>
        (msg.sender === employeeId && msg.receiver === selectedEmployeeId) || 
        (msg.sender === selectedEmployeeId && msg.receiver === employeeId)
    );

    return (
        <div className="flex">
            <div className="w-[30vw] min-h-screen">
                {users.map((item) => (
                    <div
                        key={item.employeeId}
                        className={`shadow-md border-b-2 border-gray-500 overflow-hidden ${selectedEmployeeId === item.employeeId ? 'bg-blue-500' : 'bg-gray-200'}`}
                        onClick={() => handleCardClick(item.employeeId)} // Set the selected employee
                    >
                        <div className="p-4 flex items-center">
                            <h3 className="text-xl font-semibold text-gray-800">{item.username}</h3>

                            {/* Show a green dot if the employee is online */}
                            {onlineUsers.includes(item.employeeId) && (
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 ml-2" />
                            )}
                        </div>
                    </div>
                ))}

            </div>
            <div className="min-h-screen w-[100%] bg-gray-100 flex flex-col">
                <div className="flex-1 overflow-y-auto px-2" id="chat_body">
                    {filteredMessages?.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === employeeId ? 'justify-end' : 'justify-start'} mb-3`}>
                            <div className={`p-3 rounded-lg max-w-[60%] ${msg.sender === employeeId ? 'bg-green-200' : 'bg-blue-200'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messageEndRef} /> {/* This div helps with scrolling */}
                </div>

                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            sendMessage(); // Call sendMessage when Enter is pressed
                        }
                    }}
                    className="bg-white w-[100%] p-2 mt-auto h-18 shadow-lg"
                    placeholder="Type your Message..."
                />
            </div>
        </div>
    );
};

export default Chat;
