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
import { ProductModal } from "../../components/Products/ProductModal";
import { BarcodeField } from "../../components/BarcodeField";
import { KPI } from "../../components/Metric/KPI";
import { SearchIcon } from "../../assets/SearchIcon";
import { Filters } from "../../assets/Filters";
import { Plus } from "../../assets/Plus";
import { FiltersModal } from "../../components/Filters/FiltersModal";
import { Table } from "../../components/Table";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast, ToastContainer } from "react-toastify";
import { productColumn } from "./products.column";

export const Products = () => {
  const { t } = useTranslation();
  const { data: metricData } = useGetProductsMetricsQuery();
  const [searchParams] = useSearchParams();
  const sort = searchParams.get("name");
  const {
    data,
    isLoading,
    refetch: ProductsRefetch,
  } = useGetProductsQuery({ page: 1, sort });
  const [showProductModal, setShowProductModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [query, setQuery] = useState("");
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const {
    data: searchedProducts,
    isLoading: SearchLoading,
    refetch: searchRefetch,
  } = useGetProductsByQueryQuery(query, {
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

  const [input, setInput] = useState("");

  const handleQuery = (e) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      setQuery(input);
    }
  };

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

  const handleEditProduct = async (id) => {
    try {
      if (editId === id) {
        await refetch(); // Asenkron işlemi bekle
        setShowProductModal(true);
      } else {
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
      searchRefetch();
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
      toast.error("Yazdırma işlemi başarısız!");
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
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => handleQuery(e)}
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
            columns={productColumn({
              t,
              editProduct: handleEditProduct,
              printProduct: handlePrintProductLabel,
              deleteProduct: handleDeleteProduct,
            })}
            data={filteredProducts}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
