export default function Button({variant="primary",size="md",loading=false,block=false,as:As="button",children,className="",...rest}){
  return <As className={`crai-btn crai-btn--${variant} crai-btn--${size}${block?" crai-btn--block":""} ${className}`} disabled={loading||rest.disabled} {...rest}>
    {loading && <span className="crai-spinner"/>}{children}
  </As>;
}
