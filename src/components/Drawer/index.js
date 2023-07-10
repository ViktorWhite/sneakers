import Info from "../Card/info";
import React, {useState} from "react";
import axios from "axios";
import {useCart} from "../../hooks/useCard";
import styles from './Drawer.module.scss'

const delay = (ms) => new Promise((resolve) => setTimeout (resolve, ms));

function Index({onClose, onRemove, items = [], opened}) {
    const {cartItems, setCartItems, totalPrice} = useCart()
    const [isOrderComplete, setIsOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);


    const onClickOrder = async () => {
        try {
            setIsLoading(true);
            const {data} = await axios.post('https://649a432cbf7c145d0238aabf.mockapi.io/orderds', {items: cartItems,});
            setOrderId(data.id)
            setIsOrderComplete(true);
            setCartItems([]);

            for(let i = 0; i < cartItems.length; i++){
                const item = cartItems[i];
                await axios.delete('https://649a7e36bf7c145d0238e783.mockapi.io/cart/' + item.id);
                await delay(1000)
            }

        } catch (error) {
            alert("Ошибка при создании заказа :(");
        }
        setIsLoading(false);
    }

    return (
        <div className={`${styles.overlay} ${opened ? styles.overlayVisible : ""}`}>
        <div className={styles.drawer}>
            <h2 className="d-flex justify-between mb-30">Корзина
                <img onClick={onClose} className="cu-p"
                     src="/img/btn-remove.svg"
                     alt="Close"/>
            </h2>
            {items.length > 0 ? (<div className='d-flex flex-column flex'>
                <div className="items flex">
                    {items.map((obj) => (<div key={obj.id} className="cartItem d-flex align-center mb-20">
                        <div
                            style={{backgroundImage: `url(${obj.imageUrl}`}}
                            className="cartItemImg"></div>

                        <div className="mr-20 flex">
                            <p className="mb-5">{obj.title}</p>
                            <b>{obj.price} руб.</b>
                        </div>
                        <img onClick={() => onRemove(obj.id)} className="removeBtn"
                             src="/img/btn-remove.svg"
                             alt="Remove"
                        />
                    </div>))}
                </div>
                <div className="cartTotalBlock">
                    <ul>
                        <li>
                            <span>Итого</span>
                            <div></div>
                            <b>{totalPrice} руб.</b>
                        </li>
                        <li>
                            <span>Налог 5%:</span>
                            <div></div>
                            <b>{totalPrice/100 *5} руб.</b>
                        </li>
                    </ul>
                    <button disabled={isLoading} onClick={onClickOrder} className="greenButton">
                        Оформить заказ <img src="/img/arrow.svg" alt="Arrow"/>
                    </button>
                </div>
            </div>) : (<Info
                title={isOrderComplete ? "Заказ оформлен!" : 'Корзина пустая'}
                description={isOrderComplete ? `Ваш заказ №${orderId} скоро будет передан курьерской доставке` : "Добавьте хотя бы одну пару кроссовок, чтобы сделать заказ"}
                image={isOrderComplete ? "/img/complete-order.jpg" : "/img/empty-cart.jpg"}
            />)}
        </div>
    </div>);
}

export default Index;