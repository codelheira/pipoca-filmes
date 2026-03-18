import React, { useEffect, useState } from 'react'
import {
  FaBars,
  FaDiscord,
  FaRedditAlien,
  FaSearch,
  FaTelegramPlane,
  FaTwitter,
  FaRandom,
  FaLanguage,
  FaComments,
  FaBell,
} from 'react-icons/fa'
import { BsBroadcast } from 'react-icons/bs'
import { N } from './navbar.style'
import zorosmall from '../../assets/images/zoro-small.jpeg'
import SideBar from './SideBar'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import useDebounce from '../../hooks/useDebounce'
import { useSearchAnime } from '../../hooks/useAnime'
import Spinner from '../Spinner/Spinner'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../context/AuthContext'
import styled from 'styled-components'

const NavBar = () => {
  const [searchValue, setSearchValue] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [fixed, setFixed] = useState(null)
  const [toggleSearch, setToggleSearch] = useState(false)
  const { user, loginWithGoogle, logout } = useAuth()

  const debouncedSearchedValue = useDebounce(searchValue, 600)
  const { data, isLoading } = useSearchAnime(debouncedSearchedValue)

  const handleBlur = () => {
    // Pequeno delay para permitir o clique nos resultados
    setTimeout(() => {
      setIsSearching(false)
    }, 200)
  }

  const location = useLocation()
  const locationPath = location.pathname.slice(1)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchValue.trim().length >= 2) {
      navigate(`/busca?q=${searchValue}`)
      setToggleSearch(false)
    }
  }

  useEffect(() => {
    if (open) {
      document.body.classList.add('body-hidden')
    } else {
      document.body.classList.remove('body-hidden')
    }

    window.addEventListener('scroll', () => {
      if (scrollY == '0') {
        setIsScrolled(false)
      } else {
        setIsScrolled(true)
      }
    })
    window.addEventListener('load', () => {
      if (scrollY == '0') {
        setIsScrolled(false)
      } else {
        setIsScrolled(true)
      }
    })
  }, [open, isScrolled])

  useEffect(() => {
    if (locationPath === '') {
      setFixed(true)
    } else {
      setFixed(false)
    }
  }, [locationPath])

  return (
    <N.Nav isScrolled={isScrolled} fixed={fixed}>
      {/* background layout   */}
      <N.LayoutBg open={open} onClick={() => setOpen(false)}></N.LayoutBg>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
        <FaBars
          size={24}
          color="#fff"
          style={{ cursor: 'pointer' }}
          onClick={() => setOpen(true)}
        />
        <SideBar open={open} setOpen={setOpen} />
        <N.LogoContainer to="/">
          <N.LogoImg src="/logo.png" alt="logo" />
          <N.SiteName>Pipoca Filmes</N.SiteName>
        </N.LogoContainer>
        <N.SearchForm onSubmit={handleSearch}>
          <N.Input
            placeholder="O que vai assistir?"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsSearching(true)}
            onBlur={handleBlur}
          />
          <N.SearchIcon>
            <FaSearch size={16} />
          </N.SearchIcon>
          <N.Filter>Filtro</N.Filter>
          {isSearching && (
            <N.SearchedListBox>
              {searchValue.length >= 3 && isLoading && <Spinner />}
              {searchValue.length >= 3 &&
                debouncedSearchedValue.length >= 3 &&
                data &&
                data.map((item, idx) => (
                  <N.SearchItem
                    key={idx}
                    to={item.type === 'serie' ? `/watch/serie/${item.slug}` : `/watch/${item.tipo || item.type}/${item.slug}`}
                    onClick={() => setSearchValue('')}
                  >
                    <N.SearchItemImg src={item.images.jpg.image_url} />
                    <N.SearchItemDetails>
                      <N.SearchItemTitle>{item.title}</N.SearchItemTitle>
                      <N.SearchItemAiredTime>
                        {item.year} • {item.genre ? `${item.genre} • ` : ''} <span style={{ color: 'white' }}> {item.type}</span>
                      </N.SearchItemAiredTime>
                    </N.SearchItemDetails>
                  </N.SearchItem>
                ))}
            </N.SearchedListBox>
          )}
        </N.SearchForm>
        <N.SocialIcons>
          <N.Item style={{ backgroundColor: '#6f85d5' }}>
            <FaDiscord />
          </N.Item>
          <N.Item style={{ backgroundColor: '#08c' }}>
            <FaTelegramPlane />
          </N.Item>
          <N.Item style={{ backgroundColor: '#ff3c1f' }}>
            <FaRedditAlien />
          </N.Item>
          <N.Item style={{ backgroundColor: '#1d9bf0' }}>
            <FaTwitter />
          </N.Item>
        </N.SocialIcons>
        <N.SettingsIcon>
          <N.SettingsItem>
            <BsBroadcast size={20} color="#cae962" />
            <p>Watch2gether</p>
          </N.SettingsItem>
          <N.SettingsItem>
            <FaRandom size={20} color="#cae962" />
            <p>Aleatório</p>
          </N.SettingsItem>
          <N.SettingsItem>
            <FaLanguage size={20} color="#cae962" />
            <p>Nome Original</p>
          </N.SettingsItem>
          <N.SettingsItem>
            <FaComments size={20} color="#cae962" />
            <p>Watch2gether</p>
          </N.SettingsItem>
          <N.Button>Doe agora</N.Button>
        </N.SettingsIcon>
      </div>
      {/* notification and profile  */}
      <N.Profile>
        <N.ProfileItem>
          <N.ProfileSearch
            onClick={() => setToggleSearch((prev) => !prev)}
            active={toggleSearch ? 1 : 0}
          />
          {toggleSearch && (
            <N.SearchToggle onSubmit={handleSearch}>
              <N.SearchContent>
                <N.ToggleInput
                  placeholder="O que vai assistir?"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setIsSearching(true)}
                  onBlur={handleBlur}
                />
                <N.ToggleSearchIcon>
                  <FaSearch size={16} />
                </N.ToggleSearchIcon>
              </N.SearchContent>
              {isSearching && (
                <N.SearchedListBox>
                  {searchValue.length >= 3 && isLoading && <Spinner />}
                  {searchValue.length >= 3 &&
                    debouncedSearchedValue.length >= 3 &&
                    data &&
                    data.map((item, idx) => (
                      <N.SearchItem
                        key={idx}
                        to={item.type === 'serie' ? `/watch/serie/${item.slug}` : `/watch/${item.type}/${item.slug}`}
                        onClick={() => {
                          setSearchValue('')
                          setToggleSearch(false)
                        }}
                      >
                        <N.SearchItemImg src={item.images.jpg.image_url} />
                        <N.SearchItemDetails>
                          <N.SearchItemTitle>{item.title}</N.SearchItemTitle>
                          <N.SearchItemAiredTime>
                            {item.year} • {item.genre ? `${item.genre} • ` : ''} <span style={{ color: 'white' }}> {item.type}</span>
                          </N.SearchItemAiredTime>
                        </N.SearchItemDetails>
                      </N.SearchItem>
                    ))}
                </N.SearchedListBox>
              )}
            </N.SearchToggle>
          )}
        </N.ProfileItem>
        <N.ProfileItem>
          <FaBell />
        </N.ProfileItem>
        {user ? (
          <N.ProfileItem onClick={logout} title={`Logado como ${user.name} (Clique para sair)`}>
            <N.ProfileImg src={user.picture || zorosmall} alt={user.name} />
          </N.ProfileItem>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '5px' }}>
            <GoogleLogin
              onSuccess={loginWithGoogle}
              onError={() => console.log('Login Failed')}
              useOneTap
              type="icon"
              shape="circle"
              theme="outline"
            />
          </div>
        )}
      </N.Profile>
    </N.Nav>
  )
}

export default NavBar
