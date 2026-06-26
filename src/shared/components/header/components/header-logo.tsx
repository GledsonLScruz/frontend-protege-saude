import logoImage from '../../../../assets/protege-saude-header-logo.png';

const Logo = () => {
  return (
    <div className="logo-container">
      <img
        className="logo-image"
        src={logoImage}
        alt="Logo do ProtegeSaúde"
      />
    </div>
  );
};

export default Logo;
