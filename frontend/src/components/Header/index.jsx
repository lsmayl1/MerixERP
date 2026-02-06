import React, { useState } from "react";
import { SearchIcon } from "../../assets/SearchIcon";
import { Setting } from "../../assets/Buttons/Setting";
import { Bell } from "../../assets/Buttons/Bell";
import Profile from "../../assets/Navigation/Profile";
import { useTranslation } from "react-i18next";
import { UsaFlag } from "../../assets/Languages/en";
import { AzerbaijanFlag } from "../../assets/Languages/az";
export const Header = () => {
  const { t, i18n } = useTranslation();
  const [showLanguageDropDown, setShowLanguageDropDown] = useState(false);

  const languages = [
    { name: "English", key: "en", icon: <UsaFlag /> },
    { name: "Azerbaycan", key: "az", icon: <AzerbaijanFlag /> },
  ];

  const language = languages.find((x) => x.key == i18n.language);
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
    setShowLanguageDropDown(false);
  };
  return (
    <div className="w-full  py-3   bg-headerBg flex justify-between items-center">
      <h1 className="text-white font-semibold px-14 text-2xl ">Merix</h1>
      {/* <div className="w-1/3 relative flex items-center">
        <input
          type="text"
          className="bg-[#3C3C3C] rounded-lg py-2 w-full px-10 text-white focus:ou placeholder:text-white"
          placeholder={t("search")}
        />
        <SearchIcon className={"text-white absolute ml-2"} />
      </div> */}
      <div className="flex items-center justify-between px-4 gap-8">
        <div className=" w-full  relative">
          <button
            onClick={() => setShowLanguageDropDown(!showLanguageDropDown)}
            className="border-white text-white border px-4 py-2 rounded-lg flex gap-4 items-center"
          >
            {language.icon}
            <span> {language.name}</span>
          </button>
          {showLanguageDropDown && (
            <ul className="flex w-full z-50 text-black top-11 border border-mainBorder rounded-lg flex-col  bg-white absolute ">
              {languages.map((lg) => (
                <button
                  key={lg.key}
                  onClick={() => changeLanguage(lg.key)}
                  className="px-2 text-start py-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  {lg.name}
                </button>
              ))}
            </ul>
          )}
        </div>
        <div className="flex  gap-4 items-center">
          <Setting className={"text-white stroke-white size-8 "} />
          <Bell className={"text-white size-8"} />
        </div>

        <div className="flex gap-4 items-center">
          <span>
            <Profile className={"text-white"} />
          </span>
          <div className="flex flex-col ">
            <h1 className="text-white font-medium">Admin Name</h1>
            <p className="text-gray-400 text-xs">example@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};
