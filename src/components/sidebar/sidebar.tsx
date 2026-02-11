import './sidebar.css'
import { NavLink } from 'react-router-dom'
import accentureLogo from '../../assets/images/accenture.png'
import staffingIcon from '../../assets/images/staffingIconPurple.png'
import staffingIconWhite from '../../assets/images/staffingIconWhite.png'
import konsulenterIcon from '../../assets/images/konsulenterIconPurple.png'
import konsulenterIconWhite from '../../assets/images/konsulenterIconWhite.png'

const Sidebar = () => {
    return (
        <div className="sidebar">
            <img src={accentureLogo} className="logo" alt="Accenture logo" />
            <div className="nav-links">
                <NavLink to="/staffing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <img src={staffingIcon} className="icon icon-default" alt="Staffing icon" />
                    <img src={staffingIconWhite} className="icon icon-hover" alt="Staffing icon" />
                    <span>Staffing</span>
                </NavLink>
                <NavLink to="/konsulenter" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <img src={konsulenterIcon} className="icon icon-default" alt="Konsulenter icon" />
                    <img src={konsulenterIconWhite} className="icon icon-hover" alt="Konsulenter icon" />
                    <span>Konsulenter</span>
                </NavLink>
            </div>
        </div>
    );
}

export default Sidebar;