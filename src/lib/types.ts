export type GlassInstallation = {
    id: string;
    tipo_vidrio: 'Parabrisas' | 'Luneta' | 'Vidrio Puerta' | 'Lateral' | 'Aleta';
    posicion: string;
    monto: number;
    metodo_pago: 'Efectivo' | 'Tarjeta' | 'Transferencia';
    fecha: string;
    user_id?: string;
};

export type GlassInventory = {
    id: string;
    item_name: string;
    stock: number;
    reorder_point: number;
    created_at: string;
};

export type GlassCustomer = {
    id: string;
    full_name: string;
    phone: string;
    vehicle_plate: string;
    created_at: string;
};
