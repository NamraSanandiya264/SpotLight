import mongoose from "mongoose";

const orgMemberSchema = new mongoose.Schema(
{
   user:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true
   },

   organization:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Organization",
      required:true
   },

   role:{
      type:String,
      enum:["member","core","deputy","convenor"],
      default:"member"
   }

},
{timestamps:true}
);

// 🔥 prevent duplicate join
orgMemberSchema.index({ user: 1, organization: 1 }, { unique: true });

export default mongoose.models.OrganizationMember || 
               mongoose.model("OrganizationMember", orgMemberSchema);