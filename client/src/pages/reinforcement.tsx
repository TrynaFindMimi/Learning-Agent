import { useState, useEffect, useRef } from "react";
import { Card, Typography, Layout, FloatButton, Modal, Input, Button } from "antd";
import { MessageOutlined, SendOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./reinforcement.css";
import type { ChatWithIARequest, ChatWithIAResponse } from "./model";
const MIN_CHARACTERS = 1;

export function StudentProfile() {
  const [activeSubject, setActiveSubject] = useState("Matemáticas");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const studentData = {
    courses: [
      {
        id: "exam",
        title: (subject: string) => `Exámenes de ${subject}`,
      },
      {
        id: "interview",
        title: "Entrevistas Técnicas",
      }
    ]
  };

  const handleChatClick = () => {
    setIsChatOpen(true);
    setMessages([]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages([{
        sender: "bot",
        text: "¡Hola! Soy tu asistente. ¿En qué puedo ayudarte hoy?"
      }]);
    }, 1800);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim().length >= MIN_CHARACTERS) {
      const newMessage = { sender: "user", text: inputValue.trim() };
      setMessages(prev => [...prev, newMessage]);
      setInputValue("");
      setIsTyping(true);

      try {
        const response = await fetch("http://localhost:3000/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: inputValue } as ChatWithIARequest),
        });

        const data = await response.json() as ChatWithIAResponse;
        console.log("respuesta", data)
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: data.answer }
        ]);
      } catch (error) {
        console.error("Error al obtener respuesta de la IA:", error);
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: "Lo siento, hubo un error al obtener la respuesta." }
        ]);
      } finally {
        setIsTyping(false);
      }
    } else {
      console.warn(`El mensaje debe tener al menos ${MIN_CHARACTERS} caracteres.`);
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <Layout className="layout">
      <Layout.Content className="content">
        <div className="content-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 mx-auto max-w-7xl">
            {studentData.courses.map((course) => (
              <Link to={`/${course.id}`} key={course.id}>
                <Card
                  hoverable
                  className="w-full h-52 overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl relative"
                >
                  <div className="relative z-10 flex flex-col justify-end items-center h-full p-6 text-center">
                    <Typography.Title level={3} className="text-gray-800 text-2xl font-bold">
                      {typeof course.title === 'function'
                        ? course.title(activeSubject)
                        : course.title}
                    </Typography.Title>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
        <div className="float-button-animation">
          <FloatButton
            icon={<MessageOutlined style={{ fontSize: "20px" }} />}
            type="primary"
            onClick={handleChatClick}
            className="float-button"
          />
        </div>
      </Layout.Content>
      <Modal
        title={null}
        open={isChatOpen}
        onCancel={() => setIsChatOpen(false)}
        footer={null}
        width="90vw"
        style={{ top: "auto", bottom: "40px", maxWidth: "600px" }}
        closable={false}
        bodyStyle={{ padding: 0, borderRadius: "20px" }}
        className="chat-modal"
      >
        <div className="chat-container">
          <div className="chat-header">
            <Typography.Title level={4} className="chat-title">
              Asistente
            </Typography.Title>
            <Typography.Text className="chat-subtitle">
              Estoy aquí para ayudarte con tus cursos
            </Typography.Text>
          </div>
          <div ref={chatBodyRef} className="chat-body">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${message.sender === 'user' ? 'user' : 'bot'}`}
              >
                {message.text}
              </div>
            ))}
            {isTyping && (
              <div className="chat-message bot">
                <div className="typing-indicator">
                  <div className="typing-text">
                    Escribiendo
                    <span className="typing-dot" style={{ animationDelay: "0s" }}></span>
                    <span className="typing-dot" style={{ animationDelay: "0.2s" }}></span>
                    <span className="typing-dot" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="chat-footer">
            <div className="input-container">
              <Input
                placeholder={`Escribe tu mensaje (mín. ${MIN_CHARACTERS} caracteres)...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={handleSendMessage}
                className="chat-input input-hover"
              />
              <div className="button-hover">
                <Button
                  type="primary"
                  onClick={handleSendMessage}
                  icon={<SendOutlined />}
                  className="send-button"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
