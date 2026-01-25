import { supabase } from "./lib/db.js";

(async function () {
const { data, error } = await supabase
  .from('voicesession') // note the double quotes
  .select("*")

console.log(data, error);

})();
