import styled, { keyframes, css } from 'styled-components'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(202, 233, 98, 0.2); }
  50% { box-shadow: 0 0 20px rgba(202, 233, 98, 0.4); }
`

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const barPulse = keyframes`
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
`

export const D = {}

D.Container = styled.div`
  min-height: 100vh;
  background: #0d0e10;
  color: #e0e0e0;
  font-family: 'Inter', 'Montserrat', sans-serif;
`

D.Header = styled.header`
  position: relative;
  padding: 2em 0;
  text-align: center;
  background: linear-gradient(180deg, rgba(202, 233, 98, 0.06) 0%, transparent 100%);
  border-bottom: 1px solid rgba(202, 233, 98, 0.1);
  animation: ${fadeIn} 0.6s ease-out;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    width: 400px;
    height: 2px;
    transform: translateX(-50%);
    background: linear-gradient(90deg, transparent, #cae962, transparent);
  }
`

D.HeaderTitle = styled.h1`
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #cae962, #a3d14e, #e0f5a0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.2em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4em;
`

D.HeaderSub = styled.p`
  font-size: 0.95rem;
  color: #888;
  font-weight: 400;
  letter-spacing: 0.5px;
`

D.HeaderVersion = styled.span`
  font-size: 0.75rem;
  color: #cae962;
  background: rgba(202, 233, 98, 0.1);
  border: 1px solid rgba(202, 233, 98, 0.2);
  padding: 0.15em 0.6em;
  border-radius: 20px;
  font-weight: 600;
  letter-spacing: 1px;
`

D.Body = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2em 1.5em 4em;
`

// ====== STATUS BAR (top metrics) ======
D.StatusBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1em;
  margin-bottom: 2.5em;
  animation: ${fadeIn} 0.7s ease-out 0.1s backwards;
`

D.StatusCard = styled.div`
  background: linear-gradient(145deg, #16171b, #1a1c21);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  padding: 1.3em 1.5em;
  display: flex;
  align-items: center;
  gap: 1em;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${props => props.accentColor || '#cae962'};
    opacity: 0.6;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(202, 233, 98, 0.15);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }
`

D.StatusIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.bg || 'rgba(202, 233, 98, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: ${props => props.color || '#cae962'};
  flex-shrink: 0;
`

D.StatusInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2em;
`

D.StatusLabel = styled.span`
  font-size: 0.75rem;
  color: #777;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  font-weight: 600;
`

D.StatusValue = styled.span`
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
`

// ====== LAYOUT GRID ======
D.Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5em;
  animation: ${fadeIn} 0.8s ease-out 0.2s backwards;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

D.FullWidthSection = styled.div`
  grid-column: 1 / -1;
`

// ====== PANEL (card containers) ======
D.Panel = styled.section`
  background: linear-gradient(145deg, #13141a, #16181e);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(202, 233, 98, 0.1);
  }
`

D.PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2em 1.5em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  background: rgba(202, 233, 98, 0.02);
`

D.PanelTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 700;
  color: #e0e0e0;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 0.5em;

  svg {
    color: #cae962;
  }
`

D.PanelBadge = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2em 0.6em;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  background: ${props => {
    if (props.type === 'live') return 'rgba(239, 68, 68, 0.15)';
    if (props.type === 'success') return 'rgba(34, 197, 94, 0.15)';
    if (props.type === 'warning') return 'rgba(234, 179, 8, 0.15)';
    return 'rgba(202, 233, 98, 0.15)';
  }};
  color: ${props => {
    if (props.type === 'live') return '#ef4444';
    if (props.type === 'success') return '#22c55e';
    if (props.type === 'warning') return '#eab308';
    return '#cae962';
  }};
  border: 1px solid ${props => {
    if (props.type === 'live') return 'rgba(239, 68, 68, 0.3)';
    if (props.type === 'success') return 'rgba(34, 197, 94, 0.3)';
    if (props.type === 'warning') return 'rgba(234, 179, 8, 0.3)';
    return 'rgba(202, 233, 98, 0.3)';
  }};

  ${props => props.type === 'live' && css`
    animation: ${barPulse} 1.5s ease-in-out infinite;
  `}
`

D.PanelBody = styled.div`
  padding: 1.5em;
`

// ====== PLAYER AREA ======
D.PlayerArea = styled.div`
  grid-column: 1 / -1;
  animation: ${fadeIn} 0.9s ease-out 0.3s backwards;
`

D.PlayerWrapper = styled.div`
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  position: relative;

  aspect-ratio: 16/9;
  background: #000;
`

// ====== INPUT AREA ======
D.InputGroup = styled.div`
  display: flex;
  gap: 0.8em;
  margin-bottom: 1.5em;
  flex-wrap: wrap;
`

D.InputField = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 0.9em 1.2em;
  background: #1a1c22;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #fff;
  font-size: 0.9rem;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  transition: all 0.3s ease;
  outline: none;

  &::placeholder {
    color: #555;
  }

  &:focus {
    border-color: rgba(202, 233, 98, 0.4);
    box-shadow: 0 0 0 3px rgba(202, 233, 98, 0.1);
  }
`

D.InputSelect = styled.select`
  padding: 0.9em 1.2em;
  background: #1a1c22;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;

  option {
    background: #1a1c22;
    color: #fff;
  }

  &:focus {
    border-color: rgba(202, 233, 98, 0.4);
  }
`

D.ActionBtn = styled.button`
  padding: 0.9em 1.8em;
  background: ${props => props.variant === 'primary' 
    ? 'linear-gradient(135deg, #cae962, #a3d14e)' 
    : 'rgba(255, 255, 255, 0.06)'};
  border: 1px solid ${props => props.variant === 'primary'
    ? 'transparent'
    : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  color: ${props => props.variant === 'primary' ? '#111' : '#ddd'};
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5em;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.8px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.variant === 'primary'
      ? '0 8px 25px rgba(202, 233, 98, 0.3)'
      : '0 4px 15px rgba(0, 0, 0, 0.3)'};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`

// ====== INFO TABLE ======
D.InfoTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`

D.InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75em 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(202, 233, 98, 0.02);
  }
`

D.InfoKey = styled.span`
  font-size: 0.82rem;
  color: #888;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5em;
`

D.InfoValue = styled.span`
  font-size: 0.85rem;
  color: #e0e0e0;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-weight: 600;
  text-align: right;
  max-width: 60%;
  word-break: break-all;

  ${props => props.status === 'good' && css`color: #22c55e;`}
  ${props => props.status === 'warn' && css`color: #eab308;`}
  ${props => props.status === 'error' && css`color: #ef4444;`}
  ${props => props.status === 'accent' && css`color: #cae962;`}
`

// ====== LOG CONSOLE ======
D.Console = styled.div`
  background: #0a0b0d;
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.78rem;
  max-height: 350px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(202, 233, 98, 0.3) transparent;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: rgba(202, 233, 98, 0.3); border-radius: 3px; }
  &::-webkit-scrollbar-track { background: transparent; }
`

D.ConsoleHeader = styled.div`
  padding: 0.6em 1em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.02);
  position: sticky;
  top: 0;
  z-index: 1;
`

D.ConsoleDots = styled.div`
  display: flex;
  gap: 6px;

  span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    &:nth-child(1) { background: #ef4444; }
    &:nth-child(2) { background: #eab308; }
    &:nth-child(3) { background: #22c55e; }
  }
`

D.ConsoleBody = styled.div`
  padding: 1em;
`

D.LogEntry = styled.div`
  display: flex;
  gap: 0.8em;
  padding: 0.3em 0;
  line-height: 1.5;
  color: ${props => {
    if (props.type === 'error') return '#ef4444';
    if (props.type === 'warn') return '#eab308';
    if (props.type === 'success') return '#22c55e';
    if (props.type === 'info') return '#60a5fa';
    return '#888';
  }};
`

D.LogTime = styled.span`
  color: #555;
  flex-shrink: 0;
  min-width: 70px;
`

D.LogText = styled.span`
  word-break: break-word;
`

// ====== FEATURES CHECKLIST ======
D.FeatureList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.8em;
`

D.FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8em;
  padding: 0.8em 1em;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(202, 233, 98, 0.03);
    border-color: rgba(202, 233, 98, 0.1);
  }
`

D.FeatureIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
  background: ${props => props.active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.04)'};
  color: ${props => props.active ? '#22c55e' : '#555'};
  border: 1px solid ${props => props.active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.06)'};
`

D.FeatureText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1em;
`

D.FeatureName = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: #ddd;
`

D.FeatureDesc = styled.span`
  font-size: 0.72rem;
  color: #777;
`

// ====== QUICK TEST BUTTONS ======
D.QuickTests = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.7em;
`

D.QuickTestBtn = styled.button`
  padding: 0.6em 1.2em;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: #ccc;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5em;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(202, 233, 98, 0.08);
    border-color: rgba(202, 233, 98, 0.25);
    color: #cae962;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 0.9rem;
  }
`

// ====== TIMELINE / EVENTS ======
D.Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(202, 233, 98, 0.3) transparent;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: rgba(202, 233, 98, 0.3); border-radius: 3px; }
`

D.TimelineEvent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1em;
  padding: 0.7em 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 5px;
    top: 1.8em;
    bottom: -0.7em;
    width: 1px;
    background: rgba(255, 255, 255, 0.06);
  }

  &:last-child::before { display: none; }
`

D.TimelineDot = styled.div`
  width: 11px;
  height: 11px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 3px;
  background: ${props => {
    if (props.type === 'error') return '#ef4444';
    if (props.type === 'success') return '#22c55e';
    if (props.type === 'warn') return '#eab308';
    return '#cae962';
  }};
  box-shadow: 0 0 8px ${props => {
    if (props.type === 'error') return 'rgba(239, 68, 68, 0.3)';
    if (props.type === 'success') return 'rgba(34, 197, 94, 0.3)';
    return 'rgba(202, 233, 98, 0.3)';
  }};
`

D.TimelineContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2em;
`

D.TimelineTitle = styled.span`
  font-size: 0.82rem;
  color: #ddd;
  font-weight: 600;
`

D.TimelineTime = styled.span`
  font-size: 0.7rem;
  color: #666;
  font-family: 'JetBrains Mono', monospace;
`

// ====== PROGRESS INDICATOR (buffer visualization) ======
D.BufferBar = styled.div`
  width: 100%;
  height: 8px;
  background: #1a1c22;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`

D.BufferFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #cae962, #8bc34a);
  border-radius: 4px;
  width: ${props => props.percent || 0}%;
  transition: width 0.3s ease;
`

D.BufferBg = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(202, 233, 98, 0.1);
  border-radius: 4px;
  width: ${props => props.percent || 0}%;
  transition: width 0.3s ease;
`

// ====== KEYBOARD SHORTCUTS TABLE ======
D.ShortcutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.6em;
`

D.ShortcutItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6em 0.8em;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
`

D.ShortcutKey = styled.kbd`
  background: #1a1c22;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 0.2em 0.6em;
  font-size: 0.75rem;
  color: #cae962;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  min-width: 30px;
  text-align: center;
`

D.ShortcutLabel = styled.span`
  font-size: 0.78rem;
  color: #999;
`

// ====== SPINNER ======
D.Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(202, 233, 98, 0.2);
  border-top-color: #cae962;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`

// ====== EMPTY STATE ======
D.EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3em;
  color: #555;
  text-align: center;
  gap: 0.8em;

  svg {
    font-size: 2.5rem;
    opacity: 0.3;
  }

  span {
    font-size: 0.85rem;
  }
`

// ====== TEST SAMPLE CARDS ======
D.SampleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.8em;
`

D.SampleCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5em;

  &:hover {
    background: rgba(202, 233, 98, 0.05);
    border-color: rgba(202, 233, 98, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }
`

D.SampleTitle = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  color: #e0e0e0;
`

D.SampleMeta = styled.span`
  font-size: 0.72rem;
  color: #888;
  display: flex;
  align-items: center;
  gap: 0.4em;
`

D.SampleBadge = styled.span`
  font-size: 0.65rem;
  padding: 0.15em 0.5em;
  border-radius: 4px;
  font-weight: 700;
  text-transform: uppercase;
  background: ${props => {
    if (props.type === 'hls') return 'rgba(96, 165, 250, 0.15)';
    if (props.type === 'mp4') return 'rgba(168, 85, 247, 0.15)';
    return 'rgba(202, 233, 98, 0.15)';
  }};
  color: ${props => {
    if (props.type === 'hls') return '#60a5fa';
    if (props.type === 'mp4') return '#a855f7';
    return '#cae962';
  }};
  border: 1px solid ${props => {
    if (props.type === 'hls') return 'rgba(96, 165, 250, 0.3)';
    if (props.type === 'mp4') return 'rgba(168, 85, 247, 0.3)';
    return 'rgba(202, 233, 98, 0.3)';
  }};
`

// ====== BACK LINK ======
D.BackLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  color: #888;
  font-size: 0.85rem;
  text-decoration: none;
  margin-bottom: 1em;
  transition: color 0.2s;
  cursor: pointer;

  &:hover {
    color: #cae962;
  }
`
