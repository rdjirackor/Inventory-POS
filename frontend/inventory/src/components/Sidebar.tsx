import { NavLink, useLocation} from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  VStack,
  chakra,
} from "@chakra-ui/react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  Tags,
  Truck,
  Settings,
} from "lucide-react";

const StyledNavLink = chakra(NavLink);

const navigation = [
  {
    heading: "WORKSPACE",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Sales", path: "/sales", icon: ShoppingCart },
      { label: "Products", path: "/products", icon: Package },
      { label: "Stock movements", path: "/stock-movements", icon: Boxes },
      { label: "Customers", path: "/customers", icon: Users },
    ],
  },
  {
    heading: "MANAGEMENT",
    items: [
      { label: "Categories", path: "/categories", icon: Tags },
      { label: "Suppliers", path: "/suppliers", icon: Truck },
      { label: "Settings", path: "/settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <Box
      w="250px"
      h="100vh"
      bg="#172033"
      color="white"
      p={4}
      position="fixed"
      top={0}
      left={0}
      overflowY="auto"
    >
      <Flex align="center" gap={3} mb={8} px={2}>
        <Box bg="#4F7DF3" p={2} borderRadius="md">
          <Package size={24} />
        </Box>

        <Box>
          <Text fontWeight="bold">Inventory POS</Text>
          <Text fontSize="xs" color="#AAB5C8">
            Management system
          </Text>
        </Box>
      </Flex>

      <VStack align="stretch" gap={6}>
        {navigation.map((group) => (
          <Box key={group.heading}>
            <Text
              fontSize="xs"
              color="#9CAAC0"
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
  bg={active ? "#30446B" : "transparent"}
  color={active ? "white" : "#D3DBE8"}
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
    </Box>
  );
}
