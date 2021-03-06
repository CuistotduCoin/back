import {
  findFirstWhere,
  findWhere,
  insertObject,
  deleteObject,
  updateObject,
  performOperation,
  performPagination,
  recreateObject,
} from './utils';
import algoliasearch from algoliasearch;
import mangopay from "mangopay2-nodejs-sdk";

var client = algoliasearch(process.env.ALGOLIASEARCH_SEARCH_APP_ID, process.env.ALGOLIASEARCH_SEARCH_KEY);
var index = client.initIndex(process.env.ALGOLIASEARCH_INDEX);

var api = new mangopay({
  clientId: process.env.MANGO_PAY_CLIENT_ID,
  clientApiKey: process.env.MANGO_PAY_CLIENT_API_KEY,
  baseUrl: process.env.MANGO_PAY_BASE_URL
});

const TABLE_NAME = 'workshops';

async function getWorkshop(args) {
  const result = await findFirstWhere(TABLE_NAME, args.workshop_id, args.is_admin);
  return result;
}

async function getWorkshops(args) {
  const result = await performPagination(TABLE_NAME, args);
  return result;
}

async function getWorkshopBookings(args) {
  const { is_allowed: isAllowed, ...otherArgs } = args;
  let result;
  if (isAllowed) {
    result = await findWhere('bookings', otherArgs.workshop_id, 'workshop_id');
  } else {
    result = { bookings: [] };
  }
  return result;
}

async function createWorkshop(args) {
  const result = await insertObject(TABLE_NAME, args);
  let wallet = {
    "Owners": [result.cook_id],
    "Description": "workshop e-wallet",
    "Currency": "EUR"
  };
  api.Wallets.create(wallet).then(function () {
    updateWorkshop({ id: result.data.id, mango_wallet_id: wallet.Id });
  });
  return result;
}

async function updateWorkshop(args) {
  const { is_admin: isAdmin, request_author_id: requestAuthorId, ...updateArgs } = args;
  const result = await performOperation(
    args,
    () => updateObject(TABLE_NAME, updateArgs),
    'cook_id',
    () => getWorkshop({ workshop_id: updateArgs.id }),
  );
  if (result && result.data) {
    if (result.data.state == "PUBLISH") {
      index.saveObject(result.data);
    }
    if (result.data.state == "CANCEL" || result.data.state == "DONE") {
      index.deleteObject(result.data);
    }
  }
  return result;
}

async function deleteWorkshop(args) {
  const result = await performOperation(
    args,
    () => {
      let workshop = getWorkshop({ workshop_id: args.id })
      if (workshop.state == "REFUSE") {
        deleteObject(TABLE_NAME, args.id)
      }
    },
    'cook_id',
    () => getWorkshop({ workshop_id: args.id }),
  );
  return result;
}

async function recreateWorkshop(args) {
  const result = await recreateObject(TABLE_NAME, args.id);
  if (result && result.data && result.data.confirmed == true) {
    index.addObject(result.data);
  }
  return result;
}

export {
  getWorkshop,
  getWorkshops,
  getWorkshopBookings,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  recreateWorkshop,
  confirmWorkshop,
};
