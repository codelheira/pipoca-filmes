import React, { useState, useEffect } from 'react'
import { D } from './discussion.style'
import axios from 'axios'
import avatarPlaceholder from '../../assets/images/avatar2-04.png'
import { IoChatbubbleOutline, IoShareOutline, IoHeartOutline, IoFlagOutline } from 'react-icons/io5'
import { API_URL } from '../../config';

const DiscussionItem = ({ discussion }) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <D.ReviewCard>
      {/* Linha da Thread para tópicos com respostas */}
      {isVisible && discussion.replies && discussion.replies.length > 0 && <D.ThreadLine />}

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <D.ReviewHeader>
          <D.Avatar
            src={avatarPlaceholder}
            alt={discussion.author}
          />
          <D.AuthorInfo>
            <D.AuthorName>{discussion.author || 'Usuário TMDB'}</D.AuthorName>
            <D.ReviewDate>{discussion.created_at}</D.ReviewDate>
          </D.AuthorInfo>
          <D.RatingBadge>TÓPICO</D.RatingBadge>
        </D.ReviewHeader>

        {/* Título do Tópico */}
        {discussion.title && (
          <h3 style={{
            color: '#cae962',
            fontSize: '1.1rem',
            marginBottom: '0.8rem',
            fontWeight: '700',
            lineHeight: '1.3'
          }}>
            {discussion.title}
          </h3>
        )}

        {/* Conteúdo */}
        <D.ContentWrapper style={{
          maxHeight: isVisible ? 'none' : '80px',
          overflow: 'hidden'
        }}>
          <D.BlurredContent isVisible={isVisible}>
            {discussion.content || "Clique para ver o conteúdo desta discussão."}
          </D.BlurredContent>

          {!isVisible && (
            <D.SpoilerOverlay isVisible={isVisible}>
              <D.ShowButton onClick={() => setIsVisible(true)}>
                Ver Discussão
              </D.ShowButton>
            </D.SpoilerOverlay>
          )}
        </D.ContentWrapper>

        {/* Barra de Interação */}
        <D.InteractionBar>
          <D.ActionButton>
            <IoChatbubbleOutline />
            {discussion.replies?.length || 0} Respostas
          </D.ActionButton>
          <D.ActionButton>
            <IoHeartOutline />
            Curtir
          </D.ActionButton>
          <D.ActionButton onClick={() => window.open(discussion.url, '_blank')}>
            <IoShareOutline />
            TMDB
          </D.ActionButton>
          <D.ActionButton style={{ marginLeft: 'auto' }}>
            <IoFlagOutline />
          </D.ActionButton>
        </D.InteractionBar>
      </div>

      {/* Respostas */}
      {isVisible && discussion.replies && discussion.replies.length > 0 && (
        <D.ReplyContainer>
          {discussion.replies.map((reply, idx) => (
            <D.ReplyCard key={idx}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <img
                  src={avatarPlaceholder}
                  alt={reply.author}
                  style={{ width: '36px', height: '36px', borderRadius: '10px' }}
                />
                <div>
                  <div style={{ color: '#cae962', fontWeight: '600', fontSize: '0.9rem' }}>{reply.author}</div>
                  <div style={{ color: '#666', fontSize: '0.75rem' }}>{reply.date}</div>
                </div>
              </div>

              {reply.quote && (
                <D.Quote>
                  "{reply.quote}"
                </D.Quote>
              )}

              <D.ReplyContent>
                {reply.content}
              </D.ReplyContent>
            </D.ReplyCard>
          ))}
        </D.ReplyContainer>
      )}
    </D.ReviewCard>
  )
}

const Discussion = ({ tmdbId, tipo }) => {
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (!tmdbId) return

    const fetchDiscussions = async () => {
      setLoading(true)
      try {

        const response = await axios.get(`${API_URL}/discussions/${tipo}/${tmdbId}`)
        setDiscussions(response.data)
      } catch (error) {
        console.error("Erro ao buscar discussões:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDiscussions()
  }, [tmdbId, tipo])

  if (!tmdbId) return null

  return (
    <D.Container>
      <D.Wrapper>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <D.Header>
            Discussões <span>TMDB</span>
          </D.Header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <D.ToggleText show={true}>Mostrar</D.ToggleText>
            <D.ToggleDiv onClick={() => setShow(!show)}>
              <D.Toggle show={show}></D.Toggle>
            </D.ToggleDiv>
          </div>
        </div>

        {show && (
          <div>
            {loading ? (
              <p style={{ color: '#cae962', textAlign: 'center' }}>Carregando discussões...</p>
            ) : discussions.length > 0 ? (
              <D.ReviewsGrid>
                {discussions.map(disc => (
                  <DiscussionItem key={disc.id} discussion={disc} />
                ))}
              </D.ReviewsGrid>
            ) : (
              <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>
                Nenhuma discussão encontrada para este título.
              </p>
            )}
          </div>
        )}
      </D.Wrapper>
    </D.Container>
  )
}

export default Discussion
