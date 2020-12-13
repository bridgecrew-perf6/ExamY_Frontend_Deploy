import React from 'react';
import { Menu } from 'antd';
import {useSelector} from 'react-redux';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

function LeftMenu(props) {
  const user = useSelector(state => state.user)

  if(!user.userData || (user.userData && !user.userData.isAuth)) {
    return(
    <Menu mode={props.mode}>
      <Menu.Item key="mail">
        <a href="/">Home</a>
      </Menu.Item>
    </Menu>
    )
  }
  else if(user.userData && user.userData.isAdmin){
    return(
    <Menu mode={props.mode}>
      <Menu.Item key="mail">
        <a href="/">Home</a>
      </Menu.Item>
      <SubMenu title={<span>Exam</span>}>
        <MenuItemGroup title="Exam">
          <Menu.Item key="MakeExam">
            <a href="/maketest"></a> Make Exam </Menu.Item>
        </MenuItemGroup>
      </SubMenu>
    </Menu>
    ) 
  }
  else{
    return(
    <Menu mode={props.mode}>
      <Menu.Item key="mail">
        <a href="/">Home</a>
      </Menu.Item>
      <SubMenu title={<span>Exam</span>}>
        <MenuItemGroup title="Exam">
          <Menu.Item key="JoinRoom">
            <a href="/joinroom"></a>Join Room</Menu.Item>
        </MenuItemGroup>
      </SubMenu>
    </Menu>
    ) 
  }
    
    
}

export default LeftMenu