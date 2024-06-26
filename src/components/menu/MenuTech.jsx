import { Button, Menu } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { encryptStorage } from "../utils/storage";

function MenuTech() {
  const navigate = useNavigate();
  const { routePath } = useAuth();
  const menuItems = [
    {
      key: 1,
      label: "Düzəliş aktı",
      target: `/${routePath}`,
    },
    {
      key: 2,
      label: "Təhvil-təslim",
      target: `handover`,
    },
  ];

  const handleMenuClick = ({ key }) => {
    const { target } = menuItems.find((item) => item.key == key) || {};
    if (target) {
      navigate(target);
    }
  };

  function handleLogout() {
    encryptStorage.clear();
    navigate("auth/login");
  }
  return (
    <>
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={["1"]}
        onClick={handleMenuClick}
        items={menuItems}
        style={{
          flex: 1,
          minWidth: 0,
        }}
      />
      <Button onClick={handleLogout}>Çıxış</Button>
    </>
  );
}

export default MenuTech;
