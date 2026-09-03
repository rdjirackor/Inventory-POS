import { NavLink} from "react-router-dom";
function Sidebar(){
    return(
        <>
                    <h2>Inventory POS</h2>

                    <nav>
                        <NavLink to="/dashboard">
                            Dashboard
                        </NavLink>

                        <NavLink to="/products">
                            Products
                        </NavLink>

                        <NavLink to="/categories">
                            Categories
                        </NavLink>

                        <NavLink to="/cashiers">
                            Cashiers
                        </NavLink>

                        <NavLink to="/suppliers">
                            Suppliers
                        </NavLink>
                    </nav>
                    </>
    );
}
export default Sidebar;