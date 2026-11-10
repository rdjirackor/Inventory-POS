import { useEffect, useState, useContext } from "react";
import { getCurrentUser } from "../apis/auth";
import type { User } from "../interfaces/interfaces";
import { AuthContext } from "../context/AuthContext";
import { NavLink, useLocation } from "react-router-dom";
import {
  Avatar,
  Box,
  Flex,
  Text,
  VStack,
  chakra,
} from "@chakra-ui/react";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Users,
  Tags,
  Truck,
  Settings as Set,
  LogOut,
  RotateCcw,
  ClipboardList,
  BadgePercent,
  Warehouse,
  MapPin,
  FileText,
  HandCoins,
  SidebarClose,
} from "lucide-react";
import { useSettings } from "../hooks/useSettings";

const palettes = ["red", "blue", "green", "purple", "orange", "teal", "pink", "cyan"];

function pickPalette(name = "") {
  const sum = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return palettes[sum % palettes.length];
}

const StyledNavLink = chakra(NavLink);

const navigation = [
  {
    heading: "WORKSPACE",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Products", path: "/products", icon: Package },
      { label: "Returns", path: "/returns", icon: RotateCcw },
      { label: "Order History", path: "/histories", icon: ClipboardList },
      { label: "Stock movements", path: "/stock-movements", icon: Boxes },
      { label: "Customers", path: "/customers", icon: Users },
    ],
  },
  {
    heading: "MANAGEMENT",
    items: [
      { label: "Categories", path: "/categories", icon: Tags },
      { label: "Cashiers", path: "/cashiers", icon: HandCoins },
      { label: "Suppliers", path: "/suppliers", icon: Truck },
      { label: "Discounts", path: "/discounts", icon: BadgePercent },
      { label: "Taxtype", path: "/taxtypes", icon: FileText },
      { label: "Branches", path: "/branches", icon: MapPin },
      { label: "Warehouses", path: "/warehouses", icon: Warehouse },
      { label: "Settings", path: "/settings", icon: Set },
    ],
  },
];

export default function Sidebar({ onClose }) {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const auth = useContext(AuthContext);
  const { settingsData, loading, error } = useSettings();

  useEffect(() => {
    getCurrentUser()
      .then(data => setUser(data))
      .catch(error => console.error(error));
  }, []);

  function handleLogout() {
    const confirm_logout = window.confirm("Sign out?");
    if (confirm_logout) {
      auth?.logout();
      window.location.reload();
    }
  }

  return (
    <Flex
      direction="column"
      w="18vw"
      h="100vh"
      bg="white"
      color="black"
      p={4}
      position="fixed"
      top={0}
      left={0}
      overflowY="auto"
      css={{
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#888",
          borderRadius: "full",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "#555",
        },
      }}
    >
      <Flex align="center" mb={8} px={2} justify="space-between">
        <Flex align="center" gap={3}>
          <Box bg="#4F7DF3" p={2} borderRadius="md">
            <Package size={26} />
          </Box>

          <Box>
            {error && <p>{error}</p>}
            {loading && <p>Loading settings...</p>}
            <Text fontWeight="bold">
              {settingsData?.business_name || "Inventory POS"}
            </Text>
            <Text fontSize="xs" color="black">
              Management system
            </Text>
          </Box>
        </Flex>

        <Box>
          <SidebarClose
            size={26}
            style={{ cursor: "pointer" }}
            onClick={onClose}
          />
        </Box>
      </Flex>

      <VStack align="stretch" gap={6}>
        {navigation.map((group) => (
          <Box key={group.heading}>
            <Text
              fontSize="xs"
              color="violet"
              fontWeight="semibold"
              mb={2}
              px={3}
            >
              {group.heading}
            </Text>

            <VStack align="stretch" gap={1}>
              {group.items.map((item) => {
                const active =
                  location.pathname === item.path ||
                  (item.path !== "/dashboard" &&
                    location.pathname.startsWith(item.path + "/"));

                const Icon = item.icon;

                return (
                  <StyledNavLink
                    key={item.path}
                    to={item.path}
                    display="flex"
                    alignItems="center"
                    gap={3}
                    px={3}
                    py={2.5}
                    borderRadius="md"
                    fontSize="sm"
                    fontWeight={active ? "semibold" : "normal"}
                    bg="transparent"
                    color={active ? "blue.700" : "black"}
                    _hover={{
                      bg: active ? "#30446B" : "#25334B",
                      color: "white",
                      textDecoration: "none",
                    }}
                    transition="background 0.2s"
                  >
                    <Icon size={18} />
                    <Text>{item.label}</Text>
                  </StyledNavLink>
                );
              })}
            </VStack>
          </Box>
        ))}
      </VStack>

      <Box mt="auto" pt={4}>
        <chakra.button
          onClick={handleLogout}
          display="flex"
          alignItems="center"
          gap={3}
          w="full"
          p={3}
          borderRadius="md"
          textAlign="left"
          _hover={{ bg: "#25334B", color: "white" }}
          transition="background 0.2s"
        >
          <Avatar.Root size="sm" colorPalette={pickPalette(user?.username)}>
            <Avatar.Fallback name={user?.username} />
          </Avatar.Root>

          <Box flex="1" minW={0}>
            <Text fontSize="sm" fontWeight="semibold" truncate>
              {user?.username}
            </Text>
            <Text fontSize="xs">{user?.role ?? "No role"}</Text>
          </Box>

          <LogOut size={16} />
        </chakra.button>
      </Box>
    </Flex>
  );
}