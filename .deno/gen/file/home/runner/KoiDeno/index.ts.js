import Scanner from './src/scanner.ts';
function on_err(x) {
    console.error(x);
}
var s = new Scanner("hello, (world)", on_err);
console.log(s.scan_tokens());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9ob21lL3J1bm5lci9Lb2lEZW5vL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FBTyxNQUFNLGtCQUFrQixDQUFDO0FBRXZDLFNBQVMsTUFBTSxDQUFDLENBQU07SUFDckIsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQixDQUFDO0FBQ0QsSUFBSSxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTY2FubmVyIGZyb20gJy4vc3JjL3NjYW5uZXIudHMnO1xuXG5mdW5jdGlvbiBvbl9lcnIoeDogYW55KSB7XG5cdGNvbnNvbGUuZXJyb3IoeCk7XG59XG52YXIgcyA9IG5ldyBTY2FubmVyKFwiaGVsbG8sICh3b3JsZClcIiwgb25fZXJyKTtcbmNvbnNvbGUubG9nKHMuc2Nhbl90b2tlbnMoKSk7Il19