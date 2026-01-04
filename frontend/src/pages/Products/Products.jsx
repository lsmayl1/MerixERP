import React, { useEffect, useState } from "react";
import {
  useDeleteProductByIdMutation,
  useGetProductByIdQuery,
  useGetProductsByQueryQuery,
  useGetProductsMetricsQuery,
  useGetProductsQuery,
  useLazyGetProductByIdQuery,
  usePostProductMutation,
  usePrintProductLabelMutation,
  usePutProductByIdMutation,
} from "../../redux/slices/ApiSlice";
import Edit from "../../assets/Edit";
import TrashBin from "../../assets/TrashBin";
import { ProductModal } from "../../components/Products/ProductModal";
import { BarcodeField } from "../../components/BarcodeField";
import { KPI } from "../../components/Metric/KPI";
import { SearchIcon } from "../../assets/SearchIcon";
import { Filters } from "../../assets/Filters";
import { Plus } from "../../assets/Plus";
import { FiltersModal } from "../../components/Filters/FiltersModal";
import { Table } from "../../components/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { NavLink, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Details } from "../../assets/Details";
import { toast, ToastContainer } from "react-toastify";
import { PrintIcon } from "../../assets/PrintIcon";

export const Products = () => {
  const { t } = useTranslation();
  const { data: metricData } = useGetProductsMetricsQuery();
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("product_id", {
      header: "ID",
      headerClassName: "text-center",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("name", {
      header: t("product"),
      headerClassName: "text-start",
      cellClassName: "text-start",
    }),
    columnHelper.accessor("barcode", {
      header: t("barcode"),
      headerClassName: "text-start bg-gray-100",
      cellClassName: "text-start",
    }),
    columnHelper.accessor("unit", {
      header: t("unit"),
      cell: (info) => (
        <span>
          {info.getValue() === "piece" ? t("piece") : info.getValue()}
        </span>
      ),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("buyPrice", {
      header: t("buyPrice"),
      cell: (info) => (
        <div className="flex items-center justify-center gap-2">
          <span>{info.getValue().toFixed(2)}</span>₼
        </div>
      ),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("sellPrice", {
      header: t("sellPrice"),
      cell: (info) => (
        <div className="flex items-center justify-center gap-2">
          <span>{parseFloat(info.getValue())?.toFixed(2)}</span>₼
        </div>
      ),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("stock", {
      header: t("stock"),
      cell: (info) => (
        <div className="flex items-center justify-center gap-2">
          <span>{info.getValue() + " əd"}</span>
        </div>
      ),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("action", {
      header: t("editDelete"),
      headerClassName: "text-center rounded-e-lg bg-gray-100",
      cellClassName: "text-center",
      cell: ({ row }) => (
        <div className="flex justify-center  gap-6">
          <button
            className="cursor-pointer"
            onClick={() => handleEditProduct(row.original.product_id)}
          >
            <Edit />
          </button>

          <NavLink
            to={`/products/${row.original.product_id}`}
            className="cursor-pointer"
          >
            <Details className="size-5" />
          </NavLink>
          <button
            onClick={() => handlePrintProductLabel(row.original.barcode)}
            className="cursor-pointer text-black"
          >
            <PrintIcon className={"size-6"} />
          </button>
          <button
            className="cursor-pointer"
            onClick={() => handleDeleteProduct(row.original.product_id)}
          >
            <TrashBin className="size-5" />
          </button>
        </div>
      ),
      enableSorting: false, // Action sütunu için sıralamayı devre dışı bırak
      enableColumnFilter: false, // Action sütunu için filtrelemeyi devre dışı bırak
    }),
  ];
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const sort = searchParams.get("name");
  const {
    data,
    isLoading,
    refetch: ProductsRefetch,
  } = useGetProductsQuery({ page, sort });
  const [showProductModal, setShowProductModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [query, setQuery] = useState("");
  const [editId, setEditId] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [editForm, setEditForm] = useState(null);
  const { data: searchedProducts, isLoading: SearchLoading } =
    useGetProductsByQueryQuery(query, {
      skip: !query || query.length < 3,
    });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const { data: editedProduct, refetch } = useGetProductByIdQuery(editId, {
    skip: !editId,
  });
  const [trigger] = useLazyGetProductByIdQuery();
  const [deleteProduct] = useDeleteProductByIdMutation();

  const [putProduct] = usePutProductByIdMutation();
  const [postProduct, { isLoading: postLoading, isError: postError }] =
    usePostProductMutation();

  const [printProductLabel] = usePrintProductLabelMutation();

  const handleClosePopUp = () => {
    setEditForm(null);
    setEditId(null);
    setShowProductModal(false);
  };
  useEffect(() => {
    if (query && query.length > 2) {
      setFilteredProducts(searchedProducts);
    } else if (data && !isLoading) {
      setFilteredProducts(data);
    }
  }, [query, searchedProducts, data, isLoading, sort]);

  useEffect(() => {
    if (editedProduct) {
      setEditForm(editedProduct);
    }
  }, [editedProduct]);

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      setQuery(inputValue);
    }
  };
  const handleEditProduct = async (id) => {
    try {
      if (editId === id) {
        // Aynı ID için refetch yap
        await refetch(); // Asenkron işlemi bekle
        setShowProductModal(true);
      } else {
        // Yeni ID için edit modunu başlat
        setEditId(id);
        setShowProductModal(true);
      }
    } catch (error) {
      console.error("Refetch hatası:", error);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id).unwrap();
      await ProductsRefetch();
      setFilteredProducts(data);
      setShowProductModal(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleBarcode = async (barcode) => {
    try {
      const res = await trigger(barcode).unwrap();
      console.log(res);
      setEditId(barcode);
      setEditForm(res);
      setShowProductModal(true);
    } catch (error) {
      setEditForm({ barcode: barcode });
      setShowProductModal(true);
      console.log(error);
    }
  };

  const handleUpdateProduct = async (data) => {
    try {
      await putProduct(data).unwrap();
      setShowProductModal(false);
      setEditId(null);
      setEditForm(null);
      ProductsRefetch();
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddProduct = async (data) => {
    try {
      await postProduct(data).unwrap();
      setShowProductModal(false);
      ProductsRefetch();
    } catch (error) {
      console.log(error);
    }
  };

  const handlePrintProductLabel = async (product) => {
    try {
      const response = await printProductLabel({ barcode: product }).unwrap();
      if (response) {
        toast.success("Yazdırma işlemi başarılı!");
      }
    } catch (error) {
      console.error("Yazdırma hatası:", error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-2 min-h-0 ">
      <ToastContainer />
      <div className="max-md:hidden"></div>
      <KPI
        data={[
          {
            label: t("totalProduct"),
            value: metricData?.totalProducts,
          },
          {
            label: t("WeightBasedProducts"),
            value: metricData?.kgBasedProducts,
          },
          {
            label: t("UnitBasedProducts"),
            value: metricData?.pieceBasedProducts,
          },
          {
            label: t("OutofStockProducts"),
            value: metricData?.zeroOrNegativeStock,
          },
        ]}
      />
      <div className="flex flex-col gap-2 w-full h-full min-h-0  bg-white rounded-lg px-2 py-2 relative">
        {showProductModal && (
          <ProductModal
            handleClose={handleClosePopUp}
            editForm={editForm}
            isEditMode={editId ? true : false}
            handleDelete={handleDeleteProduct}
            handleUpdateProduct={handleUpdateProduct}
            handleAddProduct={handleAddProduct}
          />
        )}
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2 w-full relative">
            <input
              type="text"
              placeholder="Search by name or barcode"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="px-12 w-full max-md:px-8  py-2 rounded-lg bg-white focus:outline-blue-500 "
            />
            <SearchIcon className="absolute left-2 max-md:size-5" />
          </div>
          <div className="flex  relative ">
            <button
              onClick={() => setShowFiltersModal(!showFiltersModal)}
              className="border bg-white border-gray-200 rounded-xl text-nowrap px-4 max-md:px-2 cursor-pointer flex max-md:text-xs items-center gap-2 py-1 max-md:py-0"
            >
              <Filters className="max-md:size-5" />
              {t("filters")}
            </button>
            {showFiltersModal && (
              <FiltersModal
                handleClose={setShowFiltersModal}
                // handleFilter={handleFilter}
              />
            )}
          </div>
          <button
            onClick={() => setShowProductModal(true)}
            className="border bg-white border-gray-200 rounded-xl text-nowrap px-4 cursor-pointer max-md:px-2 max-md:text-xs flex items-center gap-2 py-1 max-md:py-0"
          >
            <Plus className="max-md:size-5" />
            {t("addProduct")}
          </button>
          <BarcodeField
            handleBarcode={handleBarcode}
            shouldFocus={!showProductModal}
          />
        </div>

        <div className="min-h-0 w-full px-2">
          <Table
            columns={columns}
            data={filteredProducts}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
