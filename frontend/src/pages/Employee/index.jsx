import React, { useState } from "react";
import { Table } from "../../components/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { BaseModal } from "../../components/Modal";
import { useForm } from "react-hook-form";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetAllUsersQuery,
} from "../../redux/slices/user/userApiSlice";
import { toast, ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import TrashBin from "../../assets/Buttons/TrashBin";
import Edit from "../../assets/Buttons/Edit";
export const Employee = () => {
  const { t } = useTranslation();
  const columnHelper = createColumnHelper();
  const [modal, setModal] = useState(false);
  const { data, refetch } = useGetAllUsersQuery();
  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      headerClassName: "text-center",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("username", {
      header: t("name"),
      headerClassName: "text-start",
    }),
    columnHelper.accessor("role", {
      header: t("role"),
      cellClassName: "text-center",
      cell: ({ getValue }) => <span>{t(getValue())}</span>,
    }),
    columnHelper.accessor("phoneNumber", {
      header: t("phone"),
      cellClassName: "text-center",
    }),
    columnHelper.accessor("action", {
      header: t("update"),
      cell: ({ row }) => (
        <div className="flex gap-4 items-center justify-center">
          <button>
            <Edit />
          </button>
          {/* <button onClick={() => handleDeleteUser(row.original.id)}>
            <TrashBin />
          </button> */}
        </div>
      ),
    }),
  ];
  const [createUser] = useCreateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleCreateUser = async (data) => {
    try {
      await createUser({ ...data, role: "cashier" }).unwrap();
      setModal(false);
      await refetch();
    } catch (error) {
      toast.error(error.data.message);
      console.log(error);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id).unwrap();
      setModal(false);
      await refetch();
    } catch (error) {
      toast.error(error.data.message);
      console.log(error);
    }
  };
  return (
    <div className="flex w-full h-full rounded-xl bg-white p-4 flex-col gap-4 relative">
      <ToastContainer />
      <BaseModal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={"Create User"}
        children={
          <div className="px-10">
            <form
              className="flex flex-col gap-3"
              onSubmit={handleSubmit(handleCreateUser)}
            >
              <div className="flex flex-col gap-1">
                <span className="text-mainText">Name</span>
                <input
                  type="text"
                  {...register("username")}
                  className="px-2 py-1 border rounded-lg border-mainText/50 "
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-mainText">Phone number</span>
                <input
                  type="text"
                  {...register("phoneNumber")}
                  className="px-2 py-1 border rounded-lg border-mainText/50 "
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-mainText">Pin code</span>
                <input
                  type="text"
                  maxLength={6}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 digits",
                    },
                    maxLength: {
                      value: 6,
                      message: "Password must be at least 6 digits",
                    },
                  })}
                  className="px-2 py-1 border rounded-lg border-mainText/50 "
                />
                {errors?.password && (
                  <span className="text-red-500">
                    {errors.password.message}
                  </span>
                )}
              </div>
            </form>
          </div>
        }
        footer={
          <div className="flex justify-end">
            <button
              type="submit"
              onClick={handleSubmit(handleCreateUser)}
              className="bg-blue-600 text-white px-4 py-2  rounded-lg"
            >
              Save
            </button>
          </div>
        }
      />
      <div className="w-full flex justify-end">
        <button
          className="bg-blue-600 text-white p-2 rounded-lg"
          onClick={() => setModal(true)}
        >
          {t("createUser")}
        </button>
      </div>
      <div className="p-4">
        <Table columns={columns} data={data || []} />
      </div>
    </div>
  );
};
