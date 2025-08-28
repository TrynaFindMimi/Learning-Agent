import React, { useState, useEffect, useRef } from "react";
import { Card, Typography, Layout, FloatButton, Modal, Input, Button, Space, Row, Col } from "antd";
import { MessageOutlined, SendOutlined, BookOutlined, FileTextOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./reinforcement.css";
import type { ChatWithIARequest, ChatWithIAResponse } from "./model";

const MIN_CHARACTERS = 1;

export function StudentProfile() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const studentData = {
    courses: [
      {
        id: "exam",
        title: "Exámenes",
        description: "Preparación para exámenes y evaluaciones"
      },
      {
        id: "interview",
        title: "Entrevistas",
        description: "Preparación para entrevistas de trabajo"
      },
    ],
  };

  const handleChatClick = () => {
    setIsChatOpen(true);
    setMessages([]);
    setIsTyping(true);
    setTimeout(() => {
      setMessages([
        {
          sender: "bot",
          text: "¡Hola! Soy tu asistente. ¿En qué puedo ayudarte hoy?",
        },
      ]);
      setIsTyping(false);
    }, 3000); // Duración de la animación de 3 segundos
  };

  const handleSendMessage = async () => {
    if (inputValue.trim().length >= MIN_CHARACTERS) {
      const userMessage = { sender: "user", text: inputValue.trim() };
      setMessages(prev => [...prev, userMessage]);
      setInputValue("");
      setIsTyping(true);

      try {
        const response = await fetch("http://localhost:3000/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: userMessage.text } as ChatWithIARequest),
        });

        const data = await response.json() as ChatWithIAResponse;
        console.log("respuesta", data);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="profile-container">
      <Layout className="layout">
        <Layout.Content className="content">
          <div className="content-container">
            <Row className="side-header-container">
              <Col span={24}>
                <div className="side-header">
                  <Typography.Title level={1} className="side-header-title">
                    Refuerzo
                  </Typography.Title>
                  <Typography.Text className="side-header-subtitle">
                    Selecciona una categoría para practicar
                  </Typography.Text>
                </div>
              </Col>
            </Row>

            <div className="header-buttons">
              <Space>
                <Button 
                  icon={<BookOutlined />} 
                  onClick={() => setIsModalOpen(true)}
                  size="middle"
                  className="header-button"
                >
                  Silabo
                </Button>
                <Button 
                  icon={<FileTextOutlined />} 
                  onClick={() => setIsModalOpen(true)}
                  size="middle"
                  className="header-button"
                >
                  Documentos
                </Button>
              </Space>
            </div>

            <Row className="wide-card-container">
              <Col span={24}>
                <Card className="wide-card">
                  <Typography.Title level={3} className="wide-card-title">
                    Progreso
                  </Typography.Title>
                </Card>
              </Col>
            </Row>

            {/* Cards de Exámenes y Entrevistas */}
            <Row gutter={[24, 24]} justify="center" className="cards-responsive-container">
              {studentData.courses.map((course) => (
                <Col xs={24} sm={24} md={12} lg={12} key={course.id}>
                  <Link to={`/${course.id}`} className="card-link">
                    <Card className="simple-course-card responsive-card">
                      <Typography.Title level={3} className="simple-card-title">
                        {course.title}
                      </Typography.Title>
                      <Typography.Text className="simple-card-description">
                        {course.description}
                      </Typography.Text>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </div>
          
          <div className="float-button-container">
            <FloatButton
              icon={<MessageOutlined />}
              type="default"
              onClick={handleChatClick}
              className="simple-float-button"
            />
          </div>
        </Layout.Content>
      </Layout>
      <Modal
        title={null}
        open={isChatOpen}
        onCancel={() => setIsChatOpen(false)}
        footer={null}
        width={400}
        style={{ bottom: "20px", right: "20px", position: "fixed" }}
        closable={false}
        bodyStyle={{ padding: 0 }}
        className="simple-chat-modal"
      >
        <div className="simple-chat-container">
          <div className="simple-chat-header">
            <Typography.Title level={4} className="simple-chat-title">
              Asistente Virtual
            </Typography.Title>
            <Button 
              type="text" 
              onClick={() => setIsChatOpen(false)}
              style={{ position: 'absolute', right: '10px', top: '10px', color: 'white' }}
            >
              X
            </Button>
          </div>
          <div className="simple-chat-body">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`simple-chat-message ${message.sender === 'user' ? 'user' : 'bot'}`}
              >
                {message.text}
              </div>
            ))}
            {isTyping && (
              <div className="simple-typing-indicator">
                <span className="simple-typing-dot"></span>
                <span className="simple-typing-dot"></span>
                <span className="simple-typing-dot"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="simple-chat-footer">
            <Input
              placeholder={`Escribe tu mensaje...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleKeyPress}
              className="simple-chat-input"
              suffix={
                <Button
                  type="text"
                  onClick={handleSendMessage}
                  icon={<SendOutlined />}
                  disabled={inputValue.trim().length < MIN_CHARACTERS || isTyping}
                />
              }
            />
          </div>
        </div>
      </Modal>
      <Modal
        title="Funcionalidad en desarrollo"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            Cerrar
          </Button>,
        ]}
      >
        <p>Esta funcionalidad aún está en desarrollo y estará disponible pronto.</p>
      </Modal>
    </div>
  );
}