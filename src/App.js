import React from 'react';
import axios from "axios";
import Header from "./components/Header";
import Index from "./components/Drawer/index";
import {Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import Favorites from "./pages/Favorites";
import AppContext from './context'
import Orders from "./pages/Orders";


function App() {
    const [items, setItems] = React.useState([])
    const [cartItems, setCartItems] = React.useState([]);
    const [favorites, setFavorites] = React.useState([]);
    const [searchValue, setSearchValue] = React.useState('');
    const [cartOpened, setCartOpened] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);


    React.useEffect(() => {
        async function fetchData() {
            try {
                const [cartResponse, favoritesResponse, itemsResponse] = await Promise.all([
                    axios.get('https://649a7e36bf7c145d0238e783.mockapi.io/cart'),
                    axios.get('https://649a432cbf7c145d0238aabf.mockapi.io/favorites'),
                    axios.get('https://649a7e36bf7c145d0238e783.mockapi.io/items')
                ]);

                // const cartResponse = await axios.get('https://649a7e36bf7c145d0238e783.mockapi.io/cart');
                // const favoritesResponse = await axios.get('https://649a432cbf7c145d0238aabf.mockapi.io/favorites');
                // const itemsResponse = await axios.get('https://649a7e36bf7c145d0238e783.mockapi.io/items');

                setIsLoading(false);

                setCartItems(cartResponse.data);
                setFavorites(favoritesResponse.data);
                setItems(itemsResponse.data);
            } catch (error) {
                alert('Ошибка при запросе данных ;(');
                console.error(error);
            }
        }

        fetchData();
    }, []);

    const onAddToCart = async (obj) => {
        try {
            const findItem = cartItems.find((item) => Number(item.parentId) === Number(obj.id))
            if (findItem) {
                setCartItems(prev => prev.filter(item => Number(item.parentId) !== Number(obj.id)));
                await axios.delete(`https://649a7e36bf7c145d0238e783.mockapi.io/cart/${findItem.id}`);
            } else {
                setCartItems((prev) => [...prev, obj]);
                const {data} = await axios.post('https://649a7e36bf7c145d0238e783.mockapi.io/cart', obj);
                setCartItems((prev) => [...prev.map(item => {
                    if (item.parentId === data.parentId){
                        return{
                            ...item,
                            id: data.id
                        };
                    }
                    return item;
                })]);
            }
        } catch (error) {
            alert('Ошибка при добавлении в корзину');
            console.error(error);
        }
    };

    const onRemoveItem = async (id) => {
        try {
            setCartItems((prev) => prev.filter(item => Number(item.id) !== Number(id)));
            await axios.delete(`https://649a7e36bf7c145d0238e783.mockapi.io/cart/${id}`);
        } catch (error) {
            alert('Ошибка при удалении из корзины');
            console.error(error);
        }
    };

    const onAddToFavorite = async (obj) => {
        try {
            if (favorites.find((favObj) => Number(favObj.id) === Number(obj.id))) {
                axios.delete(`https://649a432cbf7c145d0238aabf.mockapi.io/favorites/${obj.id}`);
                setFavorites((prev) => prev.filter((item) => Number(item.id) !== Number(obj.id)));
            } else {
                const { data } = await axios.post('https://649a432cbf7c145d0238aabf.mockapi.io/favorites', obj);
                setFavorites((prev) => [...prev, data]);
            }
        } catch (error) {
            alert('Не удалось добавить фавориты');
            console.error(error);
        }
    };

    const onChangeSearchInput = (event) => {
        setSearchValue(event.target.value);
    }

    const isItemAdded = (id) => {
        return cartItems.some((obj) => Number(obj.parentId) === Number(id));
    };

    return (
        <AppContext.Provider value={{
            items,
            cartItems,
            favorites,
            isItemAdded,
            onAddToFavorite,
            setCartOpened,
            setCartItems,
            onAddToCart
        }}>
            <div className="wrapper clear">
                <Index items={cartItems} onClose={() => setCartOpened(false)} onRemove={onRemoveItem}
                       opened={cartOpened}/>
                <Header onClickCart={() => setCartOpened(true)}/>

                <Routes>
                    <Route
                        path='/'
                        element={
                            <Home
                                items={items}
                                cartItems={cartItems}
                                searchValue={searchValue}
                                setSearchValue={setSearchValue}
                                onChangeSearchInput={onChangeSearchInput}
                                onAddToFavorite={onAddToFavorite}
                                onAddToCart={onAddToCart}
                                isLoading={isLoading}
                            />
                        }
                        exact
                    />

                    <Route
                        path='/favorites'
                        element={
                            <Favorites/>
                        }
                        exact
                    />
                    <Route
                        path='/orders'
                        element={
                            <Orders/>
                        }
                        exact
                    />
                </Routes>
            </div>
        </AppContext.Provider>
    );
}

export default App;
