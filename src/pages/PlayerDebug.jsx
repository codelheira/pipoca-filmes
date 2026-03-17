import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { D } from './playerDebug.style'
import PipocaPlayer from '../components/Player/PipocaPlayer'
import NavBar from '../components/NavBar/NavBar'
import Hls from 'hls.js'
import { bufferManager } from '../hooks/usePipocaBuffer'
import {
  FaPlay, FaPause, FaArrowLeft, FaBug, FaCheckCircle,
  FaTimesCircle, FaExclamationTriangle, FaInfoCircle,
  FaVideo, FaVolumeUp, FaExpand, FaCog, FaWifi,
  FaCode, FaKeyboard, FaClock, FaSync, FaDownload,
  FaClipboardList, FaTachometerAlt, FaFilm, FaBuffer,
  FaChartBar, FaMicrochip, FaShieldAlt, FaRocket,
  FaTools, FaMagic, FaEye, FaLink, FaTerminal,
  FaNetworkWired
} from 'react-icons/fa'
import {
  MdSpeed, MdHighQuality,
  MdSubtitles, MdFullscreen, MdVolumeUp
} from 'react-icons/md'

// ====== SAMPLE TEST VIDEOS (public domain) ======
const TEST_SAMPLES = [
  {
    id: 'bbb-hls',
    title: 'Big Buck Bunny',
    type: 'hls',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    desc: 'HLS Stream - Mux Test',
    poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/330px-Big_buck_bunny_poster_big.jpg'
  },
  {
    id: 'sintel-hls',
    title: 'Sintel (Trailer)',
    type: 'hls',
    url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    desc: 'HLS Multi-quality Akamai',
    poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Sintel_poster.jpg/220px-Sintel_poster.jpg'
  },
  {
    id: 'tears-mp4',
    title: 'Tears of Steel',
    type: 'mp4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    desc: 'MP4 Direct - Google CDN',
    poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Tears_of_Steel_poster.jpg/220px-Tears_of_Steel_poster.jpg'
  },
  {
    id: 'elephant-mp4',
    title: 'Elephant Dream',
    type: 'mp4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    desc: 'MP4 Direct - Google CDN',
    poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Elephants_Dream_s1_proog.jpg/330px-Elephants_Dream_s1_proog.jpg'
  },
  {
    id: 'fmp4-hls',
    title: 'fMP4 HLS Test',
    type: 'hls',
    url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
    desc: 'Apple fMP4 HLS Advanced',
    poster: ''
  },
  {
    id: 'forBiggerBlazes',
    title: 'For Bigger Blazes',
    type: 'mp4',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    desc: 'MP4 Curto - Teste rápido',
    poster: ''
  }
]

// Player feature checklist
const PLAYER_FEATURES = [
  { name: 'HLS.js Streaming', desc: 'Suporte a streams m3u8 adaptativo', key: 'hls' },
  { name: 'MP4 Direto', desc: 'Reprodução de vídeo MP4 nativo', key: 'mp4' },
  { name: 'Play / Pause', desc: 'Controle básico de reprodução', key: 'playPause' },
  { name: 'Seek (Barra de Progresso)', desc: 'Navegação temporal por clique', key: 'seek' },
  { name: 'Volume Controle', desc: 'Slider de volume com mute', key: 'volume' },
  { name: 'Fullscreen', desc: 'Toggle tela cheia nativo', key: 'fullscreen' },

  { name: 'Auto-hide Controls', desc: 'Controles somem após 3s de inatividade', key: 'autoHide' },
  { name: 'Progress Save', desc: 'Salva progresso no localStorage por slug', key: 'progressSave' },
  { name: 'Progress Restore', desc: 'Restaura de onde parou ao reentrar', key: 'progressRestore' },
  { name: 'Skip ±10s', desc: 'Avançar/retroceder 10 segundos', key: 'skip' },
  { name: 'Buffering Indicator', desc: 'Spinner centralizado durante buffer', key: 'buffer' },
  { name: 'Logo Overlay', desc: 'Logo do Pipoca no canto (some em fullscreen)', key: 'logo' },
  { name: 'Quality Badge', desc: 'Badge "Full HD" nos controles', key: 'quality' },
  { name: 'Poster Image', desc: 'Imagem de poster antes de dar play', key: 'poster' },
  { name: 'Responsive', desc: 'Adapta-se a mobile e desktop', key: 'responsive' },
]

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const getTimestamp = () => {
  const now = new Date()
  return now.toLocaleTimeString('pt-BR', { hour12: false })
}

const PlayerDebug = () => {
  const navigate = useNavigate()

  // Player States
  const [currentUrl, setCurrentUrl] = useState('')
  const [inputUrl, setInputUrl] = useState('')
  const [streamType, setStreamType] = useState('auto')
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeSample, setActiveSample] = useState(null)
  const [posterUrl, setPosterUrl] = useState('')

  // Debug Monitoring States
  const [logs, setLogs] = useState([])
  const [events, setEvents] = useState([])
  const [playerState, setPlayerState] = useState({
    readyState: 0,
    networkState: 0,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    volume: 1,
    muted: false,
    paused: true,
    ended: false,
    playbackRate: 1,
    videoWidth: 0,
    videoHeight: 0,
    error: null,
    src: '',
    cachedMb: 0
  })
  const [hlsInfo, setHlsInfo] = useState(null)
  const [browserInfo] = useState(() => ({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookiesEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    hardwareConcurrency: navigator.hardwareConcurrency || 'N/A',
    deviceMemory: navigator.deviceMemory || 'N/A',
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    pixelRatio: window.devicePixelRatio,
    hlsSupported: Hls.isSupported(),
    nativeHlsSupported: (() => {
      const v = document.createElement('video')
      return !!v.canPlayType('application/vnd.apple.mpegurl')
    })(),

    fullscreenSupported: document.fullscreenEnabled || false,
    mediaSourceSupported: typeof MediaSource !== 'undefined',
  }))

  // Feature test states
  const [testedFeatures, setTestedFeatures] = useState({})

  // Refs
  const monitorVideoRef = useRef(null)
  const monitorIntervalRef = useRef(null)
  const logsEndRef = useRef(null)
  const eventsEndRef = useRef(null)
  const consoleBodyRef = useRef(null)
  const timelineRef = useRef(null)

  // ========== LOGGING ==========
  const addLog = useCallback((text, type = 'info') => {
    setLogs(prev => [...prev.slice(-200), { time: getTimestamp(), text, type, id: Date.now() + Math.random() }])
  }, [])

  const addEvent = useCallback((title, type = 'info') => {
    setEvents(prev => [...prev.slice(-50), { time: getTimestamp(), title, type, id: Date.now() + Math.random() }])
  }, [])

  // Auto-scroll only inside the console/timeline containers (not the page)
  useEffect(() => {
    if (consoleBodyRef.current) {
      consoleBodyRef.current.scrollTop = consoleBodyRef.current.scrollHeight
    }
  }, [logs])

  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = timelineRef.current.scrollHeight
    }
  }, [events])

  // ========== INITIAL LOG ==========
  useEffect(() => {
    addLog('🎬 PipocaPlayer Debug Console inicializado', 'success')
    addLog(`🖥️ Navegador: ${navigator.userAgent.split(' ').slice(-2).join(' ')}`, 'info')
    addLog(`📺 HLS.js suportado: ${Hls.isSupported() ? '✅ Sim' : '❌ Não'}`, Hls.isSupported() ? 'success' : 'error')

    addLog(`📐 Tela: ${window.screen.width}x${window.screen.height} @ ${window.devicePixelRatio}x`, 'info')
    addLog(`🧠 CPU Cores: ${navigator.hardwareConcurrency || '?'} | RAM: ${navigator.deviceMemory || '?'}GB`, 'info')
    addEvent('Debug Console Iniciado', 'success')
  }, [])

  // ========== MONITOR VIDEO STATE ==========
  const startMonitoring = useCallback(() => {
    if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current)
    
    monitorIntervalRef.current = setInterval(() => {
      // Try to find the video element inside the PipocaPlayer
      const video = document.querySelector('video')
      if (!video) return

      monitorVideoRef.current = video

      const buffered = video.buffered.length > 0
        ? (video.buffered.end(video.buffered.length - 1) / (video.duration || 1)) * 100
        : 0

      setPlayerState({
        readyState: video.readyState,
        networkState: video.networkState,
        currentTime: video.currentTime,
        duration: video.duration || 0,
        buffered: buffered,
        volume: video.volume,
        muted: video.muted,
        paused: video.paused,
        ended: video.ended,
        playbackRate: video.playbackRate,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        error: video.error?.message || null,
        src: video.currentSrc || video.src || '',
        cachedMb: 0 // Will be updated below
      })

      // Get cached size from PipocaBufferManager
      bufferManager.getCachedSize('debug_test').then(size => {
        setPlayerState(prev => ({ ...prev, cachedMb: size }));
      });
    }, 500)
  }, [])

  useEffect(() => {
    return () => {
      if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current)
    }
  }, [])

  // ========== LOAD VIDEO HANDLER ==========
  const handleLoadVideo = useCallback((url, sample = null) => {
    if (!url) {
      addLog('⚠️ Nenhuma URL fornecida', 'warn')
      return
    }

    setCurrentUrl(url)
    setPosterUrl(sample?.poster || '')
    setActiveSample(sample?.id || null)
    setIsLoaded(true)

    const detectedType = url.includes('.m3u8') ? 'HLS (m3u8)' : 'MP4 (direto)'
    addLog(`🔗 Carregando: ${url.substring(0, 80)}...`, 'info')
    addLog(`📦 Tipo detectado: ${detectedType}`, 'info')
    addEvent(`Vídeo carregado: ${sample?.title || 'Custom URL'}`, 'success')

    // Mark features as tested
    if (url.includes('.m3u8')) {
      setTestedFeatures(prev => ({ ...prev, hls: true }))
    } else {
      setTestedFeatures(prev => ({ ...prev, mp4: true }))
    }
    setTestedFeatures(prev => ({ ...prev, poster: true }))

    // Start monitoring after load
    setTimeout(startMonitoring, 500)
  }, [addLog, addEvent, startMonitoring])

  const handleLoadCustomUrl = () => {
    if (!inputUrl.trim()) {
      addLog('❌ Digite uma URL válida', 'error')
      return
    }
    handleLoadVideo(inputUrl.trim())
  }

  // ========== QUICK TESTS ==========
  const runQuickTest = useCallback((testName) => {
    const video = document.querySelector('video')
    if (!video && testName !== 'localStorage' && testName !== 'hlsCheck') {
      addLog('⚠️ Nenhum vídeo carregado para testar', 'warn')
      return
    }

    switch (testName) {
      case 'playPause':
        addLog('🧪 Teste: Play/Pause...', 'info')
        if (video.paused) {
          video.play().then(() => {
            addLog('✅ Play acionado com sucesso', 'success')
            setTestedFeatures(prev => ({ ...prev, playPause: true }))
            addEvent('Teste Play/Pause: OK', 'success')
          }).catch(e => {
            addLog(`❌ Erro ao dar play: ${e.message}`, 'error')
            addEvent('Teste Play/Pause: FALHOU', 'error')
          })
        } else {
          video.pause()
          addLog('⏸️ Pause acionado', 'success')
          setTestedFeatures(prev => ({ ...prev, playPause: true }))
        }
        break

      case 'seek':
        addLog('🧪 Teste: Seek para 50% do vídeo...', 'info')
        if (video.duration) {
          video.currentTime = video.duration * 0.5
          addLog(`✅ Seek para ${formatTime(video.currentTime)}`, 'success')
          setTestedFeatures(prev => ({ ...prev, seek: true }))
          addEvent('Teste Seek: OK', 'success')
        } else {
          addLog('❌ Duração não disponível para seek', 'error')
        }
        break

      case 'volume':
        addLog('🧪 Teste: Volume...', 'info')
        const origVol = video.volume
        video.volume = 0.3
        addLog(`🔊 Volume alterado: ${origVol.toFixed(1)} → 0.3`, 'success')
        setTimeout(() => { video.volume = origVol }, 1500)
        setTestedFeatures(prev => ({ ...prev, volume: true }))
        addEvent('Teste Volume: OK', 'success')
        break

      case 'mute':
        addLog('🧪 Teste: Mute toggle...', 'info')
        video.muted = !video.muted
        addLog(`🔇 Muted: ${video.muted ? 'ON' : 'OFF'}`, 'success')
        setTestedFeatures(prev => ({ ...prev, volume: true }))
        break

      case 'fullscreen':
        addLog('🧪 Teste: Fullscreen...', 'info')
        const container = video.closest('[class*="PlayerContainer"]') || video.parentElement
        if (container && document.fullscreenEnabled) {
          container.requestFullscreen().then(() => {
            addLog('✅ Fullscreen ativado', 'success')
            setTestedFeatures(prev => ({ ...prev, fullscreen: true }))
            addEvent('Teste Fullscreen: OK', 'success')
          }).catch(e => {
            addLog(`❌ Fullscreen falhou: ${e.message}`, 'error')
          })
        }
        break



      case 'skip':
        addLog('🧪 Teste: Skip +10s...', 'info')
        video.currentTime = Math.min(video.currentTime + 10, video.duration || 0)
        addLog(`⏩ Skip: agora em ${formatTime(video.currentTime)}`, 'success')
        setTestedFeatures(prev => ({ ...prev, skip: true }))
        addEvent('Teste Skip: OK', 'success')
        break

      case 'playbackRate':
        addLog('🧪 Teste: Playback Rate 2x...', 'info')
        video.playbackRate = 2.0
        addLog('✅ Velocidade: 2x (voltará ao normal em 3s)', 'success')
        setTimeout(() => {
          if (video) video.playbackRate = 1.0
          addLog('🔄 Velocidade restaurada: 1x', 'info')
        }, 3000)
        break

      case 'localStorage':
        addLog('🧪 Teste: LocalStorage Progress...', 'info')
        const keys = Object.keys(localStorage).filter(k => k.startsWith('progress_'))
        if (keys.length > 0) {
          keys.forEach(k => {
            addLog(`📁 ${k} = ${localStorage.getItem(k)}s (${formatTime(parseFloat(localStorage.getItem(k)))})`, 'info')
          })
          setTestedFeatures(prev => ({ ...prev, progressSave: true, progressRestore: true }))
          addEvent(`LocalStorage: ${keys.length} registros encontrados`, 'success')
        } else {
          addLog('📭 Nenhum progresso salvo encontrado', 'warn')
        }
        break

      case 'hlsCheck':
        addLog('🧪 Teste: HLS.js Library Check...', 'info')
        addLog(`📚 HLS.js v${Hls.version || '?'}`, 'info')
        addLog(`🔧 Worker suportado: ${typeof Worker !== 'undefined' ? '✅' : '❌'}`, typeof Worker !== 'undefined' ? 'success' : 'warn')
        addLog(`🌐 MediaSource API: ${typeof MediaSource !== 'undefined' ? '✅' : '❌'}`, typeof MediaSource !== 'undefined' ? 'success' : 'error')
        addLog(`📱 Tela: ${window.innerWidth}x${window.innerHeight}`, 'info')
        addEvent('HLS Check completo', 'info')
        break

      case 'networkInfo':
        addLog('🧪 Teste: Informações de rede...', 'info')
        if ('connection' in navigator) {
          const conn = navigator.connection
          addLog(`📶 Tipo: ${conn.effectiveType || '?'}`, 'info')
          addLog(`⬇️ Downlink: ${conn.downlink || '?'} Mbps`, 'info')
          addLog(`⏱️ RTT: ${conn.rtt || '?'} ms`, 'info')
          addLog(`💾 Data Saver: ${conn.saveData ? 'ON' : 'OFF'}`, conn.saveData ? 'warn' : 'info')
        } else {
          addLog('📶 Network Info API não disponível', 'warn')
        }
        addLog(`🌐 Online: ${navigator.onLine ? '✅' : '❌'}`, navigator.onLine ? 'success' : 'error')
        break

      default:
        addLog(`⚠️ Teste desconhecido: ${testName}`, 'warn')
    }
  }, [addLog, addEvent])

  // ========== VIDEO EVENT LISTENERS ==========
  useEffect(() => {
    if (!isLoaded) return

    const attachListeners = () => {
      const video = document.querySelector('video')
      if (!video) {
        setTimeout(attachListeners, 500)
        return
      }

      const videoEvents = [
        'loadstart', 'loadeddata', 'loadedmetadata', 'canplay', 'canplaythrough',
        'play', 'pause', 'playing', 'waiting', 'seeking', 'seeked',
        'ended', 'error', 'stalled', 'suspend', 'abort',
        'ratechange', 'volumechange', 'resize', 'emptied'
      ]

      const handlers = {}
      videoEvents.forEach(evt => {
        handlers[evt] = () => {
          const typeMap = {
            error: 'error', stalled: 'warn', abort: 'warn', waiting: 'warn',
            play: 'success', playing: 'success', canplaythrough: 'success',
            loadedmetadata: 'success', ended: 'info'
          }
          const logType = typeMap[evt] || 'info'
          addLog(`📺 Evento: ${evt}`, logType)

          // Auto-mark features
          if (evt === 'play' || evt === 'pause') {
            setTestedFeatures(prev => ({ ...prev, playPause: true }))
          }
          if (evt === 'seeked') {
            setTestedFeatures(prev => ({ ...prev, seek: true }))
          }
          if (evt === 'waiting') {
            setTestedFeatures(prev => ({ ...prev, buffer: true }))
          }
          if (evt === 'loadedmetadata') {
            addLog(`📐 Resolução: ${video.videoWidth}x${video.videoHeight}`, 'info')
            addLog(`⏱️ Duração: ${formatTime(video.duration)}`, 'info')
            setTestedFeatures(prev => ({ ...prev, responsive: true }))
          }
        }
        video.addEventListener(evt, handlers[evt])
      })

      return () => {
        videoEvents.forEach(evt => {
          video.removeEventListener(evt, handlers[evt])
        })
      }
    }

    const cleanup = attachListeners()
    return () => { if (typeof cleanup === 'function') cleanup() }
  }, [isLoaded, currentUrl, addLog])

  // ========== READY STATE / NETWORK STATE LABELS ==========
  const readyStateLabel = useMemo(() => {
    const labels = {
      0: 'HAVE_NOTHING',
      1: 'HAVE_METADATA',
      2: 'HAVE_CURRENT_DATA',
      3: 'HAVE_FUTURE_DATA',
      4: 'HAVE_ENOUGH_DATA'
    }
    return labels[playerState.readyState] || 'UNKNOWN'
  }, [playerState.readyState])

  const networkStateLabel = useMemo(() => {
    const labels = {
      0: 'NETWORK_EMPTY',
      1: 'NETWORK_IDLE',
      2: 'NETWORK_LOADING',
      3: 'NETWORK_NO_SOURCE'
    }
    return labels[playerState.networkState] || 'UNKNOWN'
  }, [playerState.networkState])

  // ========== STREAM DATA FOR PIPOCA PLAYER ==========
  const streamDataForPlayer = useMemo(() => {
    if (!currentUrl) return null
    const isHls = currentUrl.includes('.m3u8')
    return {
      url: currentUrl,
      type: isHls ? 'application/x-mpegURL' : 'video/mp4'
    }
  }, [currentUrl])

  // Count tested features
  const testedCount = Object.values(testedFeatures).filter(Boolean).length

  return (
    <D.Container>
      <NavBar />

      <D.Header>
        <D.HeaderTitle>
          <FaBug /> PipocaPlayer Debug Lab
        </D.HeaderTitle>
        <D.HeaderSub>
          Painel de Diagnóstico & Testes do Player — Feature Testing, Performance Monitoring
        </D.HeaderSub>
        <div style={{ marginTop: '0.8em', display: 'flex', gap: '0.8em', justifyContent: 'center', alignItems: 'center' }}>
          <D.HeaderVersion>v1.0 BETA</D.HeaderVersion>
          <D.HeaderVersion style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
            HLS.js {Hls.version || 'N/A'}
          </D.HeaderVersion>
        </div>
      </D.Header>

      <D.Body>
        <D.BackLink onClick={() => navigate('/')}>
          <FaArrowLeft /> Voltar ao início
        </D.BackLink>

        {/* ====== STATUS BAR ====== */}
        <D.StatusBar>
          <D.StatusCard accentColor="#cae962">
            <D.StatusIcon bg="rgba(202, 233, 98, 0.1)" color="#cae962">
              <FaCheckCircle />
            </D.StatusIcon>
            <D.StatusInfo>
              <D.StatusLabel>Features Testadas</D.StatusLabel>
              <D.StatusValue>{testedCount}/{PLAYER_FEATURES.length}</D.StatusValue>
            </D.StatusInfo>
          </D.StatusCard>

          <D.StatusCard accentColor={playerState.paused ? '#eab308' : '#22c55e'}>
            <D.StatusIcon
              bg={playerState.paused ? 'rgba(234, 179, 8, 0.1)' : 'rgba(34, 197, 94, 0.1)'}
              color={playerState.paused ? '#eab308' : '#22c55e'}
            >
              {playerState.paused ? <FaPause /> : <FaPlay />}
            </D.StatusIcon>
            <D.StatusInfo>
              <D.StatusLabel>Estado</D.StatusLabel>
              <D.StatusValue>{playerState.paused ? 'PAUSADO' : 'PLAYING'}</D.StatusValue>
            </D.StatusInfo>
          </D.StatusCard>

          <D.StatusCard accentColor="#60a5fa">
            <D.StatusIcon bg="rgba(96, 165, 250, 0.1)" color="#60a5fa">
              <MdHighQuality />
            </D.StatusIcon>
            <D.StatusInfo>
              <D.StatusLabel>Resolução</D.StatusLabel>
              <D.StatusValue>
                {playerState.videoWidth > 0
                  ? `${playerState.videoWidth}x${playerState.videoHeight}`
                  : '—'}
              </D.StatusValue>
            </D.StatusInfo>
          </D.StatusCard>

          <D.StatusCard accentColor="#a855f7">
            <D.StatusIcon bg="rgba(168, 85, 247, 0.1)" color="#a855f7">
              <FaClock />
            </D.StatusIcon>
            <D.StatusInfo>
              <D.StatusLabel>Tempo</D.StatusLabel>
              <D.StatusValue>
                {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
              </D.StatusValue>
            </D.StatusInfo>
          </D.StatusCard>

          <D.StatusCard accentColor="#f97316">
            <D.StatusIcon bg="rgba(249, 115, 22, 0.1)" color="#f97316">
              <FaTachometerAlt />
            </D.StatusIcon>
            <D.StatusInfo>
              <D.StatusLabel>Buffer</D.StatusLabel>
              <D.StatusValue>{playerState.buffered.toFixed(0)}%</D.StatusValue>
            </D.StatusInfo>
          </D.StatusCard>
        </D.StatusBar>

        {/* ====== LOAD URL INPUT ====== */}
        <D.Panel style={{ marginBottom: '1.5em' }}>
          <D.PanelHeader>
            <D.PanelTitle><FaLink /> Carregar Stream</D.PanelTitle>
          </D.PanelHeader>
          <D.PanelBody>
            <D.InputGroup>
              <D.InputField
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Cole uma URL de vídeo (HLS .m3u8 ou MP4) ..."
                onKeyDown={(e) => e.key === 'Enter' && handleLoadCustomUrl()}
              />
              <D.InputSelect value={streamType} onChange={(e) => setStreamType(e.target.value)}>
                <option value="auto">Auto Detect</option>
                <option value="hls">Forçar HLS</option>
                <option value="mp4">Forçar MP4</option>
              </D.InputSelect>
              <D.ActionBtn variant="primary" onClick={handleLoadCustomUrl}>
                <FaPlay /> Carregar
              </D.ActionBtn>
            </D.InputGroup>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6em', marginBottom: '0.8em' }}>
              <span style={{ fontSize: '0.78rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                Amostras de teste
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
            </div>

            <D.SampleGrid>
              {TEST_SAMPLES.map(sample => (
                <D.SampleCard
                  key={sample.id}
                  onClick={() => {
                    setInputUrl(sample.url)
                    handleLoadVideo(sample.url, sample)
                  }}
                  style={activeSample === sample.id ? { borderColor: 'rgba(202, 233, 98, 0.4)', background: 'rgba(202, 233, 98, 0.06)' } : {}}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <D.SampleTitle>{sample.title}</D.SampleTitle>
                    <D.SampleBadge type={sample.type}>{sample.type}</D.SampleBadge>
                  </div>
                  <D.SampleMeta>
                    <FaFilm /> {sample.desc}
                  </D.SampleMeta>
                </D.SampleCard>
              ))}
            </D.SampleGrid>
          </D.PanelBody>
        </D.Panel>

        {/* ====== PLAYER AREA ====== */}
        {isLoaded && streamDataForPlayer && (
          <D.PlayerArea>
            <D.Panel>
              <D.PanelHeader>
                <D.PanelTitle><FaVideo /> Player Preview</D.PanelTitle>
                <div style={{ display: 'flex', gap: '0.5em' }}>
                  <D.PanelBadge type="live">● LIVE</D.PanelBadge>
                  <D.PanelBadge type={playerState.error ? 'warning' : 'success'}>
                    {playerState.error ? 'ERROR' : readyStateLabel}
                  </D.PanelBadge>
                </div>
              </D.PanelHeader>
              <div style={{ padding: '1em' }}>
                <D.PlayerWrapper>
                  <PipocaPlayer
                    streamData={streamDataForPlayer}
                    poster={posterUrl}
                    slug="debug_test"
                  />
                </D.PlayerWrapper>
                <div style={{ marginTop: '0.8em' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4em' }}>
                    <span style={{ fontSize: '0.72rem', color: '#666' }}>Buffer</span>
                    <span style={{ fontSize: '0.72rem', color: '#cae962', fontFamily: "'JetBrains Mono', monospace" }}>
                      {playerState.buffered.toFixed(1)}%
                    </span>
                  </div>
                  <D.BufferBar>
                    <D.BufferBg percent={playerState.buffered} />
                    <D.BufferFill percent={(playerState.currentTime / (playerState.duration || 1)) * 100} />
                  </D.BufferBar>
                </div>
              </div>
            </D.Panel>
          </D.PlayerArea>
        )}

        {/* ====== QUICK TESTS ====== */}
        <D.Panel style={{ marginTop: '1.5em', marginBottom: '1.5em' }}>
          <D.PanelHeader>
            <D.PanelTitle><FaRocket /> Testes Rápidos</D.PanelTitle>
            <D.PanelBadge>INTERATIVO</D.PanelBadge>
          </D.PanelHeader>
          <D.PanelBody>
            <D.QuickTests>
              <D.QuickTestBtn onClick={() => runQuickTest('playPause')}>
                <FaPlay /> Play/Pause
              </D.QuickTestBtn>
              <D.QuickTestBtn onClick={() => runQuickTest('seek')}>
                <FaClock /> Seek 50%
              </D.QuickTestBtn>
              <D.QuickTestBtn onClick={() => runQuickTest('volume')}>
                <FaVolumeUp /> Volume
              </D.QuickTestBtn>
              <D.QuickTestBtn onClick={() => runQuickTest('mute')}>
                <MdVolumeUp /> Mute Toggle
              </D.QuickTestBtn>
              <D.QuickTestBtn onClick={() => runQuickTest('fullscreen')}>
                <FaExpand /> Fullscreen
              </D.QuickTestBtn>

              <D.QuickTestBtn onClick={() => runQuickTest('skip')}>
                <FaSync /> Skip +10s
              </D.QuickTestBtn>
              <D.QuickTestBtn onClick={() => runQuickTest('playbackRate')}>
                <MdSpeed /> Speed 2x
              </D.QuickTestBtn>
              <D.QuickTestBtn onClick={() => runQuickTest('localStorage')}>
                <FaDownload /> LocalStorage
              </D.QuickTestBtn>
              <D.QuickTestBtn onClick={() => runQuickTest('hlsCheck')}>
                <FaCode /> HLS Check
              </D.QuickTestBtn>
              <D.QuickTestBtn onClick={() => runQuickTest('networkInfo')}>
                <FaNetworkWired /> Network Info
              </D.QuickTestBtn>
              <D.QuickTestBtn onClick={() => setLogs([])}>
                <FaTimesCircle /> Limpar Logs
              </D.QuickTestBtn>
            </D.QuickTests>
          </D.PanelBody>
        </D.Panel>

        <D.Grid>
          {/* ====== CONSOLE LOGS ====== */}
          <D.Panel>
            <D.PanelHeader>
              <D.PanelTitle><FaTerminal /> Console de Eventos</D.PanelTitle>
              <D.PanelBadge type="live">● AO VIVO</D.PanelBadge>
            </D.PanelHeader>
            <D.PanelBody style={{ padding: 0 }}>
              <D.Console ref={consoleBodyRef}>
                <D.ConsoleHeader>
                  <D.ConsoleDots>
                    <span /><span /><span />
                  </D.ConsoleDots>
                  <span style={{ fontSize: '0.7rem', color: '#555' }}>{logs.length} entradas</span>
                </D.ConsoleHeader>
                <D.ConsoleBody>
                  {logs.length === 0 ? (
                    <D.EmptyState>
                      <FaTerminal />
                      <span>Nenhum log registrado</span>
                    </D.EmptyState>
                  ) : (
                    logs.map(log => (
                      <D.LogEntry key={log.id} type={log.type}>
                        <D.LogTime>{log.time}</D.LogTime>
                        <D.LogText>{log.text}</D.LogText>
                      </D.LogEntry>
                    ))
                  )}
                  <div ref={logsEndRef} />
                </D.ConsoleBody>
              </D.Console>
            </D.PanelBody>
          </D.Panel>

          {/* ====== PLAYER STATE INFO ====== */}
          <D.Panel>
            <D.PanelHeader>
              <D.PanelTitle><FaChartBar /> Estado do Player</D.PanelTitle>
              <D.PanelBadge type={isLoaded ? 'success' : 'warning'}>
                {isLoaded ? 'ATIVO' : 'IDLE'}
              </D.PanelBadge>
            </D.PanelHeader>
            <D.PanelBody>
              <D.InfoTable>
                <D.InfoRow>
                  <D.InfoKey><FaVideo /> readyState</D.InfoKey>
                  <D.InfoValue status={playerState.readyState >= 4 ? 'good' : playerState.readyState >= 2 ? 'warn' : 'error'}>
                    {playerState.readyState} ({readyStateLabel})
                  </D.InfoValue>
                </D.InfoRow>
                <D.InfoRow>
                  <D.InfoKey><FaBuffer /> P2P/Agressive Cache</D.InfoKey>
                  <D.InfoValue status={playerState.cachedMb > 0 ? 'good' : 'info'}>
                    {playerState.cachedMb} MB
                  </D.InfoValue>
                </D.InfoRow>
                <D.InfoRow>
                  <D.InfoKey><FaWifi /> networkState</D.InfoKey>
                  <D.InfoValue status={playerState.networkState <= 1 ? 'good' : playerState.networkState === 2 ? 'warn' : 'error'}>
                    {playerState.networkState} ({networkStateLabel})
                  </D.InfoValue>
                </D.InfoRow>
                <D.InfoRow>
                  <D.InfoKey><FaClock /> currentTime</D.InfoKey>
                  <D.InfoValue status="accent">{formatTime(playerState.currentTime)}</D.InfoValue>
                </D.InfoRow>
                <D.InfoRow>
                  <D.InfoKey><FaClock /> duration</D.InfoKey>
                  <D.InfoValue>{formatTime(playerState.duration)}</D.InfoValue>
                </D.InfoRow>
                <D.InfoRow>
                  <D.InfoKey><FaTachometerAlt /> buffer</D.InfoKey>
                  <D.InfoValue status={playerState.buffered > 80 ? 'good' : playerState.buffered > 30 ? 'warn' : 'error'}>
                    {playerState.buffered.toFixed(1)}%
                  </D.InfoValue>
                </D.InfoRow>
                <D.InfoRow>
                  <D.InfoKey><FaVolumeUp /> volume</D.InfoKey>
                  <D.InfoValue>{(playerState.volume * 100).toFixed(0)}% {playerState.muted ? '🔇' : ''}</D.InfoValue>
                </D.InfoRow>
                <D.InfoRow>
                  <D.InfoKey><MdSpeed /> playbackRate</D.InfoKey>
                  <D.InfoValue>{playerState.playbackRate}x</D.InfoValue>
                </D.InfoRow>
                <D.InfoRow>
                  <D.InfoKey><MdHighQuality /> resolução</D.InfoKey>
                  <D.InfoValue status="accent">
                    {playerState.videoWidth > 0
                      ? `${playerState.videoWidth}×${playerState.videoHeight}`
                      : '—'}
                  </D.InfoValue>
                </D.InfoRow>
                <D.InfoRow>
                  <D.InfoKey><FaExclamationTriangle /> error</D.InfoKey>
                  <D.InfoValue status={playerState.error ? 'error' : 'good'}>
                    {playerState.error || 'Nenhum'}
                  </D.InfoValue>
                </D.InfoRow>
                <D.InfoRow>
                  <D.InfoKey><FaLink /> src</D.InfoKey>
                  <D.InfoValue style={{ fontSize: '0.7rem' }}>
                    {playerState.src ? playerState.src.substring(0, 50) + '...' : '—'}
                  </D.InfoValue>
                </D.InfoRow>
              </D.InfoTable>
            </D.PanelBody>
          </D.Panel>

          {/* ====== FEATURE CHECKLIST ====== */}
          <D.Panel>
            <D.PanelHeader>
              <D.PanelTitle><FaClipboardList /> Checklist de Features</D.PanelTitle>
              <D.PanelBadge type={testedCount === PLAYER_FEATURES.length ? 'success' : 'warning'}>
                {testedCount}/{PLAYER_FEATURES.length}
              </D.PanelBadge>
            </D.PanelHeader>
            <D.PanelBody>
              <D.FeatureList>
                {PLAYER_FEATURES.map(feat => (
                  <D.FeatureItem key={feat.key}>
                    <D.FeatureIcon active={!!testedFeatures[feat.key]}>
                      {testedFeatures[feat.key] ? <FaCheckCircle /> : <FaTimesCircle />}
                    </D.FeatureIcon>
                    <D.FeatureText>
                      <D.FeatureName>{feat.name}</D.FeatureName>
                      <D.FeatureDesc>{feat.desc}</D.FeatureDesc>
                    </D.FeatureText>
                  </D.FeatureItem>
                ))}
              </D.FeatureList>
            </D.PanelBody>
          </D.Panel>

          {/* ====== BROWSER COMPATIBILITY ====== */}
          <D.Panel>
            <D.PanelHeader>
              <D.PanelTitle><FaShieldAlt /> Compatibilidade do Navegador</D.PanelTitle>
            </D.PanelHeader>
            <D.PanelBody>
              <D.InfoTable>
                <D.InfoRow>
                  <D.InfoKey><FaCode /> HLS.js Suportado</D.InfoKey>
                  <D.InfoValue status={browserInfo.hlsSupported ? 'good' : 'error'}>
                    {browserInfo.hlsSupported ? '✅ Sim' : '❌ Não'}
                  </D.InfoValue>
                </D.InfoRow>
                <D.InfoRow>
                  <D.InfoKey><FaVideo /> HLS Nativo (Safari)</D.InfoKey>
                  <D.InfoValue status={browserInfo.nativeHlsSupported ? 'good' : 'warn'}>
                    {browserInfo.nativeHlsSupported ? '✅ Sim' : '➖ Não'}
                  </D.InfoValue>
                </D.InfoRow>
                <D.InfoRow>
                  <D.InfoKey><MdPictureInPictureAlt /> Picture-in-Picture</D.InfoKey>
                  <D.InfoValue status={browserInfo.pipSupported ? 'good' : 'error'}>
                    {browserInfo.pipSupported ? '✅ Sim' : '❌ Não'}
                  </D.InfoValue>
                </D.InfoRow>
                <D.InfoRow>
                  <D.InfoKey><MdFullscreen /> Fullscreen API</D.InfoKey>
                  <D.InfoValue status={browserInfo.fullscreenSupported ? 'good' : 'error'}>
                    {browserInfo.fullscreenSupported ? '✅ Sim' : '❌ Não'}
                  </D.InfoValue>
                </D.InfoRow>
                <D.InfoRow>
                  <D.InfoKey><FaCog /> MediaSource API</D.InfoKey>
                  <D.InfoValue status={browserInfo.mediaSourceSupported ? 'good' : 'error'}>
                    {browserInfo.mediaSourceSupported ? '✅ Sim' : '❌ Não'}
                  </D.InfoValue>
                </D.InfoRow>
                <D.InfoRow>
                  <D.InfoKey><FaMicrochip /> Hardware</D.InfoKey>
                  <D.InfoValue>{browserInfo.hardwareConcurrency} cores / {browserInfo.deviceMemory}GB RAM</D.InfoValue>
                </D.InfoRow>
                <D.InfoRow>
                  <D.InfoKey><FaExpand /> Tela</D.InfoKey>
                  <D.InfoValue>{browserInfo.screenWidth}×{browserInfo.screenHeight} @{browserInfo.pixelRatio}x</D.InfoValue>
                </D.InfoRow>
                <D.InfoRow>
                  <D.InfoKey><FaWifi /> Online</D.InfoKey>
                  <D.InfoValue status={browserInfo.onLine ? 'good' : 'error'}>
                    {browserInfo.onLine ? '✅ Conectado' : '❌ Offline'}
                  </D.InfoValue>
                </D.InfoRow>
              </D.InfoTable>
            </D.PanelBody>
          </D.Panel>

          {/* ====== EVENT TIMELINE ====== */}
          <D.FullWidthSection>
            <D.Panel>
              <D.PanelHeader>
                <D.PanelTitle><FaClock /> Timeline de Eventos</D.PanelTitle>
                <D.PanelBadge>{events.length} eventos</D.PanelBadge>
              </D.PanelHeader>
              <D.PanelBody>
                {events.length === 0 ? (
                  <D.EmptyState>
                    <FaClock />
                    <span>Nenhum evento registrado ainda. Carregue um vídeo para começar.</span>
                  </D.EmptyState>
                ) : (
                  <D.Timeline ref={timelineRef}>
                    {events.map(evt => (
                      <D.TimelineEvent key={evt.id}>
                        <D.TimelineDot type={evt.type} />
                        <D.TimelineContent>
                          <D.TimelineTitle>{evt.title}</D.TimelineTitle>
                          <D.TimelineTime>{evt.time}</D.TimelineTime>
                        </D.TimelineContent>
                      </D.TimelineEvent>
                    ))}
                    <div ref={eventsEndRef} />
                  </D.Timeline>
                )}
              </D.PanelBody>
            </D.Panel>
          </D.FullWidthSection>

          {/* ====== KEYBOARD SHORTCUTS ====== */}
          <D.FullWidthSection>
            <D.Panel>
              <D.PanelHeader>
                <D.PanelTitle><FaKeyboard /> Atalhos do Player (Referência)</D.PanelTitle>
              </D.PanelHeader>
              <D.PanelBody>
                <D.ShortcutGrid>
                  <D.ShortcutItem>
                    <D.ShortcutLabel>Play / Pause</D.ShortcutLabel>
                    <D.ShortcutKey>Click</D.ShortcutKey>
                  </D.ShortcutItem>
                  <D.ShortcutItem>
                    <D.ShortcutLabel>Avançar 10s</D.ShortcutLabel>
                    <D.ShortcutKey>→</D.ShortcutKey>
                  </D.ShortcutItem>
                  <D.ShortcutItem>
                    <D.ShortcutLabel>Voltar 10s</D.ShortcutLabel>
                    <D.ShortcutKey>←</D.ShortcutKey>
                  </D.ShortcutItem>
                  <D.ShortcutItem>
                    <D.ShortcutLabel>Toggle Mute</D.ShortcutLabel>
                    <D.ShortcutKey>🔇</D.ShortcutKey>
                  </D.ShortcutItem>
                  <D.ShortcutItem>
                    <D.ShortcutLabel>Tela Cheia</D.ShortcutLabel>
                    <D.ShortcutKey>⛶</D.ShortcutKey>
                  </D.ShortcutItem>
                  <D.ShortcutItem>
                    <D.ShortcutLabel>Picture-in-Picture</D.ShortcutLabel>
                    <D.ShortcutKey>PiP</D.ShortcutKey>
                  </D.ShortcutItem>
                  <D.ShortcutItem>
                    <D.ShortcutLabel>Seek Manual</D.ShortcutLabel>
                    <D.ShortcutKey>Barra</D.ShortcutKey>
                  </D.ShortcutItem>
                  <D.ShortcutItem>
                    <D.ShortcutLabel>Volume Slider</D.ShortcutLabel>
                    <D.ShortcutKey>Hover 🔊</D.ShortcutKey>
                  </D.ShortcutItem>
                </D.ShortcutGrid>
              </D.PanelBody>
            </D.Panel>
          </D.FullWidthSection>
        </D.Grid>

      </D.Body>
    </D.Container>
  )
}

export default PlayerDebug
