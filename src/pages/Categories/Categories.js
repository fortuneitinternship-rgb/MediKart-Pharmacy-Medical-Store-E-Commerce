import React from "react";
import ShopByCategory from "../../components/ShopByCategory/ShopByCategory";
import "./Categories.modules.css"
function Categories() {

    return (
        <div>
            <ShopByCategory showMoreButton={true} />
        </div>
    );
}

export default Categories;