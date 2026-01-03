import { Router, json } from "express";
import { serve, setup } from 'swagger-ui-express';
import fs from "fs";
import path from 'path';

import UsersController from "./controllers/UsersController.js";
import ServicesController from "./controllers/ServicesController.js";
import OrderOfServiceController from "./controllers/OrderOfServiceController.js";
import StatusPaymentController from "./controllers/StatusPaymentController.js";
import StatusServiceController from "./controllers/StatusServiceController.js";
import TypesProductController from "./controllers/TypesProductController.js";
import PanelControlController from "./controllers/PanelControlController.js";
import PanelAnalyticalController from "./controllers/PanelAnalyticalController.js";
import ToolsController from "./controllers/ToolsController.js";
import ExpensesController from "./controllers/ExpensesController.js";

import AuthMiddleware from "./middlewares/AuthMiddleware.js";
import UsersMiddleware from "./middlewares/UsersMiddleware.js";
import ServicesMiddleware from "./middlewares/ServicesMiddleware.js";
import OrderOfServiceMiddleware from "./middlewares/OrderOfServiceMiddleware.js";
import StatusPaymentMiddleware from "./middlewares/StatusPaymentMiddleware.js";
import StatusServiceMiddleware from "./middlewares/StatusServiceMiddleware.js";
import TypesProductMiddleware from "./middlewares/TypesProductMiddleware.js";
import ExpensesMiddleware from "./middlewares/ExpensesMiddleware.js";

const swaggerFile = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'swagger-output.json'))
);
const router = Router();

router.use(json());
router.use("/", serve);
router.get("/", setup(swaggerFile)
  /*
    #swagger.ignore = true
  */
);

router.get(
  "/users", AuthMiddleware.authToken,
  UsersController.getAll
  /*
    #swagger.tags = ['Usuários']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);
router.get(
  "/users/signature/:id",
  AuthMiddleware.authToken,
  UsersController.getSignature
  /*
    #swagger.tags = ['Usuários']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);
router.post(
  "/users",
  UsersMiddleware.validateRegister,
  UsersController.register
  /*
    #swagger.tags = ['Usuários']
  */
);
router.post(
  "/users/login",
  UsersMiddleware.validateLogin,
  UsersController.login
  /*
    #swagger.tags = ['Usuários']
  */
);
router.delete(
  "/users/:id", AuthMiddleware.authToken,
  UsersController.remove
  /*
    #swagger.tags = ['Usuários']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);


router.get(
  "/expenses", AuthMiddleware.authToken,
  ExpensesController.getAll
  /*
    #swagger.tags = ['Despesas']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
)

router.post(
  "/expenses", AuthMiddleware.authToken,
  ExpensesMiddleware.validateCreate,
  ExpensesController.create
  /*
    #swagger.tags = ['Despesas']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
)

router.delete(
  "/expenses/:id", AuthMiddleware.authToken,
  ExpensesController.remove
  /*
    #swagger.tags = ['Despesas']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
)

router.get(
  "/services", AuthMiddleware.authToken,
  ServicesController.getAll
  /*
    #swagger.tags = ['Serviços']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);
router.get(
  "/services/warehouse",
  AuthMiddleware.authToken,
  ServicesController.getAllWharehouse
  /*
    #swagger.tags = ['Serviços']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);
router.post(
  "/services",
  AuthMiddleware.authToken,
  ServicesMiddleware.validateCreate,
  ServicesController.create
  /*
    #swagger.tags = ['Serviços']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);
router.put(
  "/services/warehouse/:id/:value",
  AuthMiddleware.authToken,
  ServicesController.updateWarehouse
  /*
    #swagger.tags = ['Serviços']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);
router.put(
  "/services/info/client/:id",
  AuthMiddleware.authToken,
  ServicesMiddleware.validateUpdateInfoClient,
  ServicesController.updateInfoClient
  /*
    #swagger.tags = ['Serviços']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);
router.put(
  "/services/status/:id/:status",
  AuthMiddleware.authToken,
  ServicesController.updateStatusService
  /*
    #swagger.tags = ['Serviços']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);
router.put(
  "/services/status/payment/:id/:status",
  AuthMiddleware.authToken,
  ServicesController.updateStatusPayment
  /*
    #swagger.tags = ['Serviços']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);
router.delete(
  "/services/:id/:cod/:typeTable",
  AuthMiddleware.authToken,
  ServicesController.remove
  /*
    #swagger.tags = ['Serviços']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);



router.get(
  "/order_of_service/",
  AuthMiddleware.authToken,
  OrderOfServiceController.getAll
  /*
    #swagger.tags = ['Ordens de Serviço']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);
router.get(
  "/order_of_service/:cod",
  AuthMiddleware.authToken,
  OrderOfServiceController.getUnique
  /*
    #swagger.tags = ['Ordens de Serviço']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);
router.put(
  "/order_of_service/estimate/:cod",
  AuthMiddleware.authToken,
  OrderOfServiceMiddleware.validateUpdateEstimate,
  OrderOfServiceController.updateEstimate
  /*
    #swagger.tags = ['Ordens de Serviço']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);
router.delete(
  "/order_of_service/estimate/:cod/:idEstimate",
  AuthMiddleware.authToken,
  OrderOfServiceController.removeEstimate
  /*
    #swagger.tags = ['Ordens de Serviço']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);



router.get(
  "/status_payment",
  AuthMiddleware.authToken,
  StatusPaymentController.getAll
  /*
    #swagger.tags = ['Status de Pagamento']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);
router.post(
  "/status_payment",
  AuthMiddleware.authToken,
  StatusPaymentMiddleware.validateCreate,
  StatusPaymentController.create
  /*
    #swagger.tags = ['Status de Pagamento']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);
router.delete(
  "/status_payment/:id",
  AuthMiddleware.authToken,
  StatusPaymentController.remove
  /*
    #swagger.tags = ['Status de Pagamento']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);



router.get(
  "/status_service",
  AuthMiddleware.authToken,
  StatusServiceController.getAll
  /*
    #swagger.tags = ['Status de Serviço']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);
router.post(
  "/status_service",
  AuthMiddleware.authToken,
  StatusServiceMiddleware.validateCreate,
  StatusServiceController.create
  /*
    #swagger.tags = ['Status de Serviço']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);
router.delete(
  "/status_service/:id",
  AuthMiddleware.authToken,
  StatusServiceController.remove
  /*
    #swagger.tags = ['Status de Serviço']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);


router.get(
  "/types_product",
  AuthMiddleware.authToken,
  TypesProductController.getAll
  /*
    #swagger.tags = ['Tipos de Produtos']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);
router.post(
  "/types_product",
  AuthMiddleware.authToken,
  TypesProductMiddleware.validateCreate,
  TypesProductController.create
  /*
    #swagger.tags = ['Tipos de Produtos']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);
router.delete(
  "/types_product/:id",
  AuthMiddleware.authToken,
  TypesProductController.remove
  /*
    #swagger.tags = ['Tipos de Produtos']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);


router.get(
  "/panel_control/product_by_service",
  AuthMiddleware.authToken,
  PanelControlController.getCountProductByService
  /*
    #swagger.tags = ['Paineis de Controle']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);

router.get(
  "/panel_control/status_by_service",
  AuthMiddleware.authToken,
  PanelControlController.getCountStatusByService
  /*
    #swagger.tags = ['Paineis de Controle']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);

router.get(
  "/panel_control/status_payment_by_service",
  AuthMiddleware.authToken,
  PanelControlController.getCountStatusPaymentByService
  /*
    #swagger.tags = ['Paineis de Controle']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);

router.get(
  "/panel_control/info_performace_yearly",
  AuthMiddleware.authToken,
  PanelControlController.getInfoPerformaceYearly
  /*
    #swagger.tags = ['Paineis de Controle']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);

router.get(
  "/panel_analytical/info_values_os_paid",
  AuthMiddleware.authToken,
  PanelAnalyticalController.getSumValuesOrdersPaid
  /*
    #swagger.tags = ['Paineis de Analíticos']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);

router.get(
  "/panel_analytical/info_invoicing_liquid",
  AuthMiddleware.authToken,
  PanelAnalyticalController.getValuesInvoicingLiquid
  /*
    #swagger.tags = ['Paineis de Analíticos']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);


router.get(
  "/tools/notifications",
  AuthMiddleware.authToken,
  ToolsController.getNotifications
  /*
    #swagger.tags = ['Utilitários']
    #swagger.security = [{
      "bearerAuth": []
    }] 
  */
);

export default router;
