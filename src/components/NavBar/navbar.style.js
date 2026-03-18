import styled from 'styled-components'
import { FaSearch } from 'react-icons/fa'
import { Link } from 'react-router-dom'

export const N = {}

N.Nav = styled.nav`
  position: ${({ fixed }) => (fixed ? 'fixed' : 'relative')};
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 70px;
  gap: 1em;
  padding-left: 1em;
  background-color: ${({ isScrolled }) =>
    isScrolled ? 'rgba(32, 33, 37, 0.9)' : 'rgba(32, 33, 37, 0)'};
  transition: all ease 250ms;
  z-index: 100;

  @media screen and (max-width: 1299px) {
    position: relative;
    background: #2a2c31;
  }
  @media screen and (max-width: 578px) {
    height: 50px;
    gap: 0;
    padding-left: 0.3em;
  }
`
N.LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75em;
  height: 40px;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.85;
  }

  @media only screen and (max-width: 578px) {
    height: 34px;
    gap: 0.5em;
  }
`
N.LogoImg = styled.img`
  width: auto;
  height: 100%;
`
N.SiteName = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  letter-spacing: -0.02em;
  white-space: nowrap;
  
  @media only screen and (max-width: 900px) {
    display: none;
  }
  
  @media only screen and (max-width: 578px) {
    font-size: 1rem;
  }
`
N.SearchForm = styled.form`
  display: flex;
  width: 400px;
  height: 40px;
  position: relative;

  @media only screen and (max-width: 1300px) {
    display: none;
  }
`
N.Input = styled.input`
  height: 100%;
  width: 100%;
  outline: none;
  padding: 1em;
  color: #495057;
`
N.Filter = styled.button`
  position: absolute;
  right: 1.5em;
  top: 7px;
  height: 26px;
  line-height: 26px;
  border-radius: 3px;
  padding: 0 6px;
  font-size: 11px;
  background-color: #4a4b51;
  color: #fff;
  z-index: 3;
  cursor: pointer;
`
N.SearchIcon = styled.button`
  position: absolute;
  display: inline-block;
  top: 3px;
  right: 4.5em;
  line-height: 40px;
  width: 40px;
  height: 40px;
  border: none;
  padding: 0 12px;
  color: #111;
  background-color: transparent;
  text-align: center;
  z-index: 2;
`
N.SearchedListBox = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  left: 0;
  top: 100%;
  width: 100%;
  background-color: #1a1b1e;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  max-height: 450px;
  overflow-y: auto;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.05);
`
N.SearchItem = styled(Link)`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1.25em;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  text-decoration: none;
  transition: all 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(202, 233, 98, 0.1);
  }

  &:nth-of-type(n + 7) {
    display: none;
  }
`
N.SearchItemImg = styled.img`
  width: 45px;
  height: 65px;
  object-fit: cover;
  border-radius: 4px;
`
N.SearchItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  flex: 1;
  overflow: hidden;
`
N.SearchItemTitle = styled.p`
  font-size: 14px;
  line-height: 1.2em;
  width: 100%;
  margin-bottom: 4px;
  font-weight: 600;
  color: #fff;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: #cae962;
  }
`
N.SearchItemSmallTitle = styled.p`
  font-size: 13px;
  line-height: 1.2em;
  max-width: 200px;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #aaa;
`
N.SearchItemAiredTime = styled.p`
  font-size: 12px;
  line-height: 1.2em;
  width: 100%;
  text-align: left;
  color: #aaa;
`

N.SocialIcons = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  gap: 0.2em;

  @media only screen and (max-width: 1300px) {
    display: none;
  }
`
N.Item = styled.div`
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  width: 32px;
  text-align: center;
  padding: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
`

N.SettingsIcon = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  gap: 1em;

  @media only screen and (max-width: 760px) {
    display: none;
  }
`
N.SettingsItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 11px;
  color: #fff;
  gap: 0.2em;
`
N.Button = styled.button`
  line-height: 36px;
  border-radius: 20px;
  font-size: 13px;
  border: none !important;
  font-weight: 500;
  padding: 0 1rem;
  color: #000;
  box-shadow: none !important;
  background-color: #00ffb7;

  @media only screen and (max-width: 1300px) {
    display: none;
  }
`
N.LoginWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
  
  @media only screen and (max-width: 578px) {
    margin-left: 0;
  }
`
N.Profile = styled.div`
  display: flex;
  padding-right: 1.4em;
  @media only screen and (max-width: 578px) {
    padding-right: 0.4em;
  }
`
N.ProfileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 5px;
  text-align: center;
  color: #fff;
  cursor: pointer;

  &:nth-child(1) {
    display: none;
  }
  @media only screen and (max-width: 1300px) {
    &:nth-child(1) {
      display: flex;
    }
    width: 30px;
    height: 30px;
  }
`
N.ProfileSearch = styled(FaSearch)`
  display: none;
  @media only screen and (max-width: 1300px) {
    display: initial;
    color: ${({ active }) => (!active ? '#fff' : '#cae962')};
  }
`
N.SearchToggle = styled.form`
  position: absolute;
  background-color: #202125;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 60px;
  left: 0;
  top: 70px;
  padding: 0 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);

  @media screen and (max-width: 578px) {
    top: 50px;
    height: 55px;
  }
`
N.SearchContent = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  height: 40px;
  margin: 0 auto;
`
N.ToggleInput = styled.input`
  width: 100%;
  height: 100%;
  outline: none;
  padding: 0 12px;
  padding-right: 45px;
  color: #fff;
  background: #2a2c31;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  font-size: 14px;

  &::placeholder {
    color: #888;
  }
`
N.ToggleSearchIcon = styled.button`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  right: 0;
  width: 40px;
  height: 100%;
  border: none;
  color: #cae962;
  background-color: transparent;
  cursor: pointer;
  z-index: 2;
`

N.ProfileImg = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
`
N.LayoutBg = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(32, 33, 37, 0.8);
  z-index: 1000;
  display: ${({ open }) => (open ? 'block' : 'none')};
`
