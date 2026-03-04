import { useSelector } from "react-redux";

export const usePermissionType = (menu) => {
  const { userPermission } = useSelector((state) => state);
  const existingPermission = userPermission.reduce(
    (accumalator, item) => {
      const permissionSlug = item.slug;
      const writeMenu = `${menu}-write-`;
      const updateMenu = `${menu}-update-`;
      const deleteMenu = `${menu}-delete-`;
      // Find the index of the first occurrence
      const indexOfWriteMenu = permissionSlug.indexOf(writeMenu);
      const indexOfUpdateMenu = permissionSlug.indexOf(updateMenu);
      const indexOfDeleteMenu = permissionSlug.indexOf(deleteMenu);
      const isMenuExist =
        indexOfWriteMenu !== -1 ||
        indexOfUpdateMenu !== -1 ||
        indexOfDeleteMenu !== -1;
      const getTypeMenu = (type, slug, ind) => {
        if (ind !== -1) {
          const typeVal = permissionSlug.substring(ind + slug.length);
          if (type == "write") {
            if (typeVal !== "assigned") {
              accumalator[type] = true;
            }
          } else {
            accumalator[type] = true;
          }
        }
      };
      if (isMenuExist) {
        getTypeMenu("write", writeMenu, indexOfWriteMenu);
        getTypeMenu("update", updateMenu, indexOfUpdateMenu);
        getTypeMenu("delete", deleteMenu, indexOfDeleteMenu);
      }

      return accumalator;
      // console.log('ind',indexOfWriteMenu,indexOfUpdateMenu,indexOfDeleteMenu)

      //  return permission
    },
    { write: false, update: false, delete: false }
  );
  // // Find the index of the first occurrence of '-write-'
  // const indexOfWrite = userPermission.indexOf("-write-");

  // // Extract the substring after '-write-'
  // const extractedPermission =
  //   indexOfWrite !== -1
  //     ? permissionSlug.substring(indexOfWrite + "-write-".length)
  //     : permissionSlug;

  // console.log(extractedPermission); // Output: added-and-assigned

  return existingPermission;
};
