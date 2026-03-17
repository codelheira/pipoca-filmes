import React from 'react';
import { FaTv, FaTimes, FaCircleNotch, FaChevronRight } from 'react-icons/fa';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  z-index: 150;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContent = styled.div`
  background: #1a1a1c;
  width: 90%;
  max-width: 400px;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(202, 233, 98, 0.2);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
  &:hover { color: #fff; transform: rotate(90deg); }
`;

const Title = styled.h3`
  margin: 0 0 20px 0;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.2rem;
  
  svg { color: #cae962; }
`;

const DeviceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 5px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(202, 233, 98, 0.3); border-radius: 2px; }
`;

const DeviceItem = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 12px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;

  &:hover {
    background: rgba(202, 233, 98, 0.1);
    border-color: #cae962;
    transform: translateX(5px);
  }

  span { font-weight: 500; font-size: 0.95rem; }
  svg { color: #888; font-size: 0.8rem; }
  &:hover svg { color: #cae962; }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  gap: 15px;
  color: #888;
  font-size: 0.9rem;

  svg {
    font-size: 2rem;
    color: #cae962;
    animation: spin 1s linear infinite;
  }

  @keyframes spin { 100% { transform: rotate(360deg); } }
`;

const NoDevices = styled.div`
  text-align: center;
  padding: 30px 0;
  color: #888;
  font-size: 0.9rem;
  
  p { margin-bottom: 20px; }
`;

const RefreshBtn = styled.button`
  background: rgba(202, 233, 98, 0.15);
  color: #cae962;
  border: 1px solid rgba(202, 233, 98, 0.3);
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  &:hover { background: rgba(202, 233, 98, 0.25); }
`;

const CastModal = ({ isOpen, onClose, devices, isLoading, onSelect, onRefresh }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseBtn onClick={onClose}><FaTimes /></CloseBtn>
        <Title><FaTv /> Transmitir para TV</Title>
        
        {isLoading ? (
          <LoadingState>
            <FaCircleNotch />
            <span>Procurando TVs na rede...</span>
          </LoadingState>
        ) : devices.length > 0 ? (
          <DeviceList>
            {devices.map((device, idx) => (
              <DeviceItem key={idx} onClick={() => onSelect(device)}>
                <span>{device.name}</span>
                <FaChevronRight />
              </DeviceItem>
            ))}
          </DeviceList>
        ) : (
          <NoDevices>
            <p>Nenhuma TV encontrada na mesma rede WiFi.</p>
            <RefreshBtn onClick={onRefresh}>Tentar Novamente</RefreshBtn>
          </NoDevices>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default CastModal;
