import { useState } from "react";

import iconsmenu from '../../../public/iconsmenu.png';
import iconsclose from '../../../public/iconsclose.png';

const Navbar = () => {
  const [active, setActive] = useState("Home");
  const [toggle, setToggle] = useState(false);

  return (
    <nav className="w-full flex py-2 px-8 justify-between items-center navbar bg-trasnparent">
      <img src='/logo ph tech preto.png' alt="hoobank" className="w-[60px] h-[auto]" />

      <ul className="list-none sm:flex hidden justify-end items-center flex-1">
        <li className="d-flex justify-between w-100">
          <a className="mr-6 cursor-pointer">Menu</a>
        </li>
      </ul>

      <div className="sm:hidden flex flex-1 justify-end items-center">

        <div
          className={`${!toggle ? "hidden" : "flex"
            } p-6 bg-black-gradient absolute top-20 right-0 mx-4 my-8 min-w-[140px] rounded-xl sidebar`}
        >
          <ul className="list-none flex justify-end items-start flex-1 flex-col text-white">
            <li>
              <a>Home</a>
              <a>PHtech</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;