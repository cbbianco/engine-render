import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

const moduleConfig = {
    uuid: "inventory-pro-2026",
    modulo: "Inventario Pro",
    userId: "1",
    instruccion: "Sistema integral de inventario con gestión de productos y stock",
    configurationUi: {
        config: {
            metadata: {
                orchestrationType: "MANAGEMENT",
                title: "Control Total de Inventario (MCP Powered)"
            },
            module: "Inventario Pro",
            path: "/inventory-pro",
            method: "GET",
            order: 1,
            menu: "menu-item:Logística:Inventario Pro",
            icon: "svg-archive",
            breadcrumb: [
                { label: "Home", path: "/dashboard" },
                { label: "Logística", path: "/logistics" }
            ],
            raw: true
        },
        schema: [
            { type: "separator", label: "Dashboard de Estado Actual", property: "sec_dashboard", column: "col-12", separator: true },
            { type: "estimated-revenue", label: "Valor Total en Stock", property: "total_value", column: "col-4", config: { prefix: "$", color: "success" } },
            { type: "estimated-revenue", label: "Alertas de Stock Bajo", property: "low_stock_count", column: "col-4", config: { color: "danger" } },
            { type: "estimated-revenue", label: "Movimientos Hoy", property: "today_movements", column: "col-4", config: { color: "info" } },
            { type: "separator", label: "Listado Maestro & Niveles", property: "sec_list", column: "col-12", separator: true },
            { type: "table-products", label: "Inventario por Bodega", property: "inventory_list", column: "col-12", config: { searchable: true, filterable: true } },
            { type: "separator", label: "Operaciones Rápidas (Registrar Movimiento)", property: "sec_ops", column: "col-12", separator: true },
            { type: "select", label: "Producto (SKU)", property: "op_sku", column: "col-3", required: true, options: [ { label: "MacBook Pro M3", value: "PROD-001" }, { label: "Monitor Studio Display", value: "PROD-002" } ] },
            { type: "select", label: "Bodega", property: "op_warehouse", column: "col-3", required: true, options: [ { label: "Bodega Central", value: "BOD-001" }, { label: "Bodega Norte", value: "BOD-002" } ] },
            { type: "select", label: "Tipo de Movimiento", property: "op_type", column: "col-2", required: true, options: [ { label: "Entrada (IN)", value: "IN" }, { label: "Salida (OUT)", value: "OUT" }, { label: "Ajuste (ADJ)", value: "ADJUSTMENT" } ] },
            { type: "number", label: "Cantidad", property: "op_quantity", column: "col-2", required: true, config: { min: 1 } },
            { type: "button", label: "Ejecutar Movimiento", property: "op_submit", column: "col-2", variant: "primary", action: "submit", config: { icon: "refresh-cw" } }
        ]
    },
    orchestrationDetails: { status: "active" },
    createdAt: new Date(),
    updatedAt: new Date()
};

async function run() {
    try {
        await client.connect();
        const database = client.db('solutionsplusone_crm');
        const modules = database.collection('modules');
        
        // Borrar si existe
        await modules.deleteOne({ uuid: "inventory-pro-2026" });
        
        const result = await modules.insertOne(moduleConfig);
        console.log(`Module inserted with ID: ${result.insertedId}`);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
