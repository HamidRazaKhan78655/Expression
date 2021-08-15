const runInputWidget = ({container, inputType, labelledInputs}) => {
    const inputButtons = `
        <?xml version="1.0" encoding="UTF-8" standalone="no" ?>
        <a class="input-widget-button" data-latex-command="\\superscript" data-move-cursor="-1" title="Raise to a power">
            <svg height="40%" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5H0V13H8V5Z" fill="#C4C4C4"/>
            <path d="M14 0H9V5H14V0Z" fill="#C4C4C4"/>
            </svg>
        </a>
        <a class="input-widget-button" data-latex-command="\\frac" data-move-cursor="-1" title="Fraction">
            <svg height="60%" viewBox="0 0 15 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.146 16.2525H0.17395V15.1666H14.146V16.2525Z" fill="currentColor"/>
            <path d="M12 0H2V12H12V0Z" fill="#C4C4C4"/>
            <path d="M12 19H2V31H12V19Z" fill="#C4C4C4"/>
            </svg>
        </a>
        <a class="input-widget-button" data-latex-command="\\binom" data-move-cursor="-1" title="Vector">
            <svg height="60%" viewBox="0 0 31 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.68659 43.2484C9.68659 43.2846 9.6504 43.3389 9.57801 43.4113H9.01697C8.99284 43.3872 8.82393 43.2243 8.51023 42.9227C8.19654 42.621 7.92507 42.3616 7.69583 42.1445C7.46659 41.9273 7.14083 41.5593 6.71855 41.0405C6.29626 40.5217 5.92224 40.0331 5.59648 39.5746C5.27072 39.1161 4.89066 38.5068 4.45631 37.7467C4.02197 36.9866 3.64794 36.2325 3.33425 35.4845C3.02055 34.7364 2.68876 33.8376 2.33887 32.7879C1.98897 31.7382 1.71751 30.6765 1.52446 29.6027C1.33142 28.5289 1.15647 27.3042 0.999625 25.9288C0.842777 24.5534 0.770386 23.1417 0.782451 21.6939C0.782451 13.1155 2.97832 6.41932 7.37007 1.60529C7.64757 1.30366 7.90697 1.03822 8.14828 0.808982C8.38958 0.579743 8.58866 0.386699 8.7455 0.229851C8.90235 0.0730033 8.99284 -0.00542071 9.01697 -0.00542071H9.57801C9.6504 0.0669707 9.68659 0.121264 9.68659 0.15746C9.68659 0.217786 9.56594 0.374634 9.32464 0.628004C9.08333 0.881374 8.76963 1.2373 8.38355 1.69578C7.99746 2.15426 7.56311 2.72735 7.0805 3.41507C6.59789 4.10279 6.10925 4.96545 5.61458 6.00306C5.1199 7.04067 4.66142 8.1929 4.23914 9.45975C3.81686 10.7266 3.4549 12.2468 3.15327 14.0204C2.85164 15.794 2.65859 17.7003 2.57414 19.7393C2.55001 20.1978 2.53794 20.8554 2.53794 21.712C2.53794 26.4054 3.10501 30.5076 4.23914 34.0185C5.37327 37.5295 7.12273 40.5096 9.48752 42.9589C9.62023 43.1037 9.68659 43.2002 9.68659 43.2484Z" fill="currentColor"/>
            <path d="M21.2873 0.211753C21.2873 0.115232 21.3054 0.0549054 21.3416 0.030775C21.3778 0.00664452 21.4562 -0.00542071 21.5769 -0.00542071H21.6855H21.9569C21.9811 0.0187097 22.15 0.18159 22.4637 0.483221C22.7774 0.784852 23.0488 1.04425 23.2781 1.26143C23.5073 1.4786 23.8331 1.84659 24.2554 2.3654C24.6777 2.8842 25.0517 3.37284 25.3774 3.83132C25.7032 4.2898 26.0833 4.8991 26.5176 5.65921C26.9519 6.41932 27.326 7.16736 27.6397 7.90334C27.9534 8.63932 28.2852 9.53818 28.635 10.5999C28.9849 11.6617 29.2564 12.7234 29.4495 13.7851C29.6425 14.8469 29.8174 16.0715 29.9743 17.459C30.1311 18.8465 30.2035 20.2581 30.1915 21.6939C30.1915 23.1055 30.1492 24.3 30.0648 25.2773C29.4977 32.1786 27.3441 37.6864 23.6038 41.8006C23.3263 42.1022 23.0669 42.3677 22.8256 42.5969C22.5843 42.8262 22.3853 43.0192 22.2284 43.176C22.0716 43.3329 21.9811 43.4113 21.9569 43.4113H21.6855C21.5286 43.4113 21.4261 43.3993 21.3778 43.3751C21.3296 43.351 21.2994 43.2907 21.2873 43.1941C21.9388 42.5426 22.5783 41.7946 23.2057 40.95C26.6805 36.329 28.4179 29.9103 28.4179 21.6939C28.4179 19.2567 28.261 16.9824 27.9473 14.871C27.6336 12.7596 27.2475 10.986 26.7891 9.55024C26.3306 8.11448 25.7696 6.76317 25.106 5.49632C24.4424 4.22948 23.8391 3.24616 23.2962 2.54638C22.7532 1.84659 22.156 1.14681 21.5045 0.447025C21.4804 0.422895 21.4562 0.398765 21.4321 0.374634C21.408 0.350504 21.3899 0.326373 21.3778 0.302243C21.3657 0.278112 21.3476 0.260014 21.3235 0.247949L21.2873 0.211753Z" fill="currentColor"/>
            <path d="M21 6H10V17H21V6Z" fill="#C4C4C4"/>
            <path d="M21 27H10V38H21V27Z" fill="#C4C4C4"/>
            </svg>  
        </a>
        <a class="input-widget-button" data-latex-write="(,)" data-move-cursor="-2" title="Coordinate">
            <svg height="40%" viewBox="0 0 35 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.705139 9.048C0.705139 8.21558 0.765459 7.42539 0.886099 6.67742C1.00674 5.92946 1.14548 5.28403 1.30231 4.74115C1.45914 4.19827 1.68232 3.66746 1.97186 3.1487C2.2614 2.62995 2.49061 2.22581 2.65951 1.93627C2.8284 1.64674 3.08175 1.33307 3.41954 0.995281C3.75733 0.657489 3.95639 0.452401 4.01671 0.380017C4.07703 0.307633 4.22783 0.180961 4.46911 7.15256e-07H4.70436H4.77674C4.94564 7.15256e-07 5.03008 0.0542887 5.03008 0.162865C5.03008 0.199057 4.92754 0.325729 4.72245 0.542881C4.51736 0.760033 4.27005 1.07973 3.98052 1.50197C3.69098 1.92421 3.39541 2.44296 3.09381 3.05822C2.79221 3.67349 2.53887 4.5059 2.33378 5.55547C2.12869 6.60504 2.02615 7.76922 2.02615 9.048C2.02615 10.3268 2.12869 11.4849 2.33378 12.5224C2.53887 13.5599 2.78618 14.3984 3.07572 15.0378C3.36525 15.6772 3.66082 16.1959 3.96242 16.594C4.26402 16.9921 4.51736 17.3118 4.72245 17.5531C4.92754 17.7944 5.03008 17.9211 5.03008 17.9331C5.03008 18.0417 4.9396 18.096 4.75864 18.096H4.70436H4.46911L3.96242 17.6617C2.8284 16.6363 2.00202 15.3575 1.48327 13.8253C0.964515 12.2932 0.705139 10.7008 0.705139 9.048Z" fill="currentColor"/>
            <path d="M15.0118 12.9386C15.0118 12.9386 15.0118 12.7878 15.0118 12.4862C15.0118 12.1846 15.1084 11.9253 15.3014 11.7081C15.4944 11.491 15.7538 11.3824 16.0795 11.3824C16.4173 11.3824 16.7189 11.5332 16.9843 11.8348C17.2497 12.1364 17.3884 12.6672 17.4005 13.4272C17.4005 13.8495 17.3462 14.2596 17.2376 14.6578C17.1291 15.0559 17.0024 15.3997 16.8576 15.6892C16.7129 15.9788 16.556 16.2261 16.3871 16.4312C16.2182 16.6363 16.0735 16.7991 15.9528 16.9198C15.8322 17.0404 15.7538 17.0947 15.7176 17.0826C15.6693 17.0826 15.5909 17.0283 15.4823 16.9198C15.3738 16.8112 15.3195 16.7328 15.3195 16.6845C15.3195 16.6363 15.3858 16.5397 15.5185 16.395C15.6512 16.2502 15.802 16.0692 15.9709 15.8521C16.1398 15.6349 16.2967 15.3333 16.4414 14.9473C16.5862 14.5612 16.6827 14.1209 16.731 13.6263V13.4091L16.7129 13.4272C16.6887 13.4393 16.6586 13.4514 16.6224 13.4634C16.5862 13.4755 16.55 13.4936 16.5138 13.5177C16.4776 13.5418 16.4233 13.5539 16.3509 13.5539C16.2786 13.5539 16.2062 13.5599 16.1338 13.572C15.8081 13.572 15.5427 13.4695 15.3376 13.2644L15.0118 12.9386Z" fill="currentColor"/>
            <path d="M30.2903 0.0180967L30.3627 7.15256e-07C30.423 7.15256e-07 30.4833 7.15256e-07 30.5436 7.15256e-07H30.7608L31.2675 0.434305C32.4015 1.45974 33.2279 2.73853 33.7466 4.27066C34.2654 5.80278 34.5247 7.39523 34.5247 9.048C34.5247 9.86835 34.4644 10.6585 34.3438 11.4186C34.2231 12.1786 34.0844 12.824 33.9276 13.3548C33.7707 13.8857 33.5476 14.4165 33.258 14.9473C32.9685 15.4781 32.7393 15.8823 32.5704 16.1597C32.4015 16.4372 32.1542 16.7448 31.8284 17.0826C31.5027 17.4204 31.3097 17.6195 31.2494 17.6798C31.189 17.7401 31.0503 17.8547 30.8332 18.0236C30.797 18.0598 30.7728 18.0839 30.7608 18.096H30.5436C30.4471 18.096 30.3808 18.096 30.3446 18.096C30.3084 18.096 30.2782 18.0779 30.2541 18.0417C30.23 18.0055 30.2119 17.9512 30.1998 17.8788C30.2119 17.8668 30.2782 17.7884 30.3989 17.6436C32.2688 15.7013 33.2037 12.8361 33.2037 9.048C33.2037 5.2599 32.2688 2.3947 30.3989 0.452401C30.2782 0.307633 30.2119 0.229217 30.1998 0.217153C30.1998 0.120641 30.23 0.0542887 30.2903 0.0180967Z" fill="currentColor"/>
            <path d="M13 3H5V16H13V3Z" fill="#C4C4C4"/>
            <path d="M30 3H22V16H30V3Z" fill="#C4C4C4"/>
            </svg> 
        </a>
        <a class="input-widget-button" data-latex-command="\\sqrt" data-move-cursor="0" title="Square Root">
            <svg height="40%" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0)">
            <path d="M1.72129 12.3447C1.64889 12.3447 1.56444 12.2964 1.46791 12.1999C1.37139 12.1034 1.3171 12.0189 1.30503 11.9465C1.29296 11.8742 1.47998 11.6932 1.86607 11.4036C2.25216 11.114 2.65032 10.8124 3.06055 10.4987C3.47077 10.185 3.70001 10.01 3.74828 9.97385C3.77241 9.94972 3.80257 9.93765 3.83877 9.93765H3.85686C3.92926 9.93765 4.01371 10.0402 4.11024 10.2453C4.20676 10.4504 4.53253 11.1563 5.08754 12.3628C5.31678 12.8816 5.50379 13.2979 5.64858 13.6116L7.18692 16.9597C7.19898 16.9597 7.82638 15.6748 9.06912 13.1048C10.3119 10.5349 11.5546 7.94686 12.7973 5.34073C14.0401 2.73461 14.6856 1.40138 14.7338 1.34105C14.8062 1.17213 14.9269 1.08768 15.0958 1.08768C15.1803 1.08768 15.2526 1.12387 15.313 1.19627C15.3733 1.26866 15.4155 1.34105 15.4397 1.41344V1.52203L11.2228 10.2634L6.96974 19.0591C6.92148 19.1436 6.80686 19.1858 6.62588 19.1858C6.51729 19.1858 6.44489 19.1677 6.4087 19.1315C6.38457 19.1074 5.79336 17.8284 4.63508 15.2947L2.89766 11.4941L2.60809 11.6932C2.42711 11.838 2.2401 11.9827 2.04705 12.1275C1.85401 12.2723 1.74542 12.3447 1.72129 12.3447Z" fill="currentColor"/>
            <path d="M29.158 2.17175H15.0777V1.08587H29.158V2.17175Z" fill="currentColor"/>
            <path d="M28 4H16V19H28V4Z" fill="#C4C4C4"/>
            </g>
            <defs>
            <clipPath id="clip0">
            <rect width="29.16" height="19.184" fill="white"/>
            </clipPath>
            </defs>
            </svg>
        </a>
        <a class="input-widget-button" data-latex-command="\\dot" data-move-cursor="0" title="Repeating Decimal">
            <svg height="45%" viewBox="0 0 9 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.43823 1.89593C3.43823 1.55814 3.54681 1.29273 3.76396 1.09971C3.98111 0.906681 4.24652 0.810169 4.56018 0.810169C4.83766 0.834297 5.07894 0.936841 5.28402 1.1178C5.48911 1.29876 5.59166 1.55814 5.59166 1.89593C5.59166 2.25785 5.48911 2.52929 5.28402 2.71025C5.07894 2.89121 4.82559 2.98169 4.52399 2.98169C4.22239 2.98169 3.96905 2.89121 3.76396 2.71025C3.55887 2.52929 3.4503 2.25785 3.43823 1.89593Z" fill="currentColor"/>
            <rect x="1" y="4" width="7" height="9" fill="#C4C4C4"/>
            </svg>
        </a>
        <a class="input-widget-button" data-latex-write="\\times{10^{}}" data-move-cursor="-1" title="Standard Form">
            <svg height="22%" viewBox="0 0 42 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.77675 14.605C8.77675 14.8463 8.65007 14.967 8.3967 14.967C8.33638 14.967 8.20366 14.8705 7.99855 14.6774C7.79345 14.4844 7.22639 13.9233 6.29737 12.9943L4.41522 11.1122L2.51496 13.0124C1.23606 14.2672 0.578513 14.9067 0.542318 14.9308C0.494058 14.9549 0.45183 14.967 0.415634 14.967C0.319113 14.967 0.234658 14.9308 0.162267 14.8584C0.0898765 14.786 0.0476486 14.7015 0.0355835 14.605C0.0355835 14.5206 0.120039 14.3879 0.288951 14.2069C0.457862 14.0259 1.02492 13.4528 1.99013 12.4876L3.87229 10.6054L1.99013 8.72329C1.01286 7.74601 0.445797 7.17292 0.288951 7.00401C0.132104 6.8351 0.0476486 6.70238 0.0355835 6.60586C0.0355835 6.49728 0.0717788 6.41282 0.144169 6.35249C0.21656 6.29217 0.307048 6.26201 0.415634 6.26201C0.47596 6.26201 0.518188 6.26804 0.542318 6.2801C0.578513 6.30423 1.23606 6.94368 2.51496 8.19846L4.41522 10.0987L6.29737 8.21655C7.22639 7.28754 7.79345 6.72651 7.99855 6.53347C8.20366 6.34043 8.33638 6.24391 8.3967 6.24391C8.65007 6.24391 8.77675 6.36456 8.77675 6.60586C8.77675 6.69032 8.71643 6.7989 8.59578 6.93162C8.47513 7.06434 7.88394 7.65553 6.82221 8.70519L4.94005 10.6054L6.82221 12.5057C7.83567 13.5192 8.4148 14.1043 8.55958 14.2612C8.70436 14.418 8.77675 14.5326 8.77675 14.605Z" fill="currentColor"/>
            <path d="M19.3313 4.66941L19.096 4.75989C18.9271 4.82022 18.6858 4.88054 18.3721 4.94087C18.0584 5.0012 17.7085 5.04342 17.3225 5.06755H16.9786V4.23506H17.3225C17.8895 4.21093 18.4144 4.12044 18.897 3.9636C19.3796 3.80675 19.7174 3.66197 19.9104 3.52925C20.1035 3.39654 20.2724 3.26382 20.4172 3.1311C20.4413 3.09491 20.5137 3.07681 20.6343 3.07681C20.7429 3.07681 20.8455 3.11301 20.942 3.1854V8.5966L20.9601 14.0259C21.0445 14.1104 21.1169 14.1646 21.1773 14.1888C21.2376 14.2129 21.3824 14.237 21.6116 14.2612C21.8408 14.2853 22.2149 14.2974 22.7337 14.2974H23.2042V15.1299H23.0051C22.7518 15.0937 21.7926 15.0756 20.1276 15.0756C18.4867 15.0756 17.5396 15.0937 17.2863 15.1299H17.0691V14.2974H17.5396C17.8051 14.2974 18.0343 14.2974 18.2273 14.2974C18.4204 14.2974 18.5712 14.2913 18.6798 14.2793C18.7884 14.2672 18.8849 14.2491 18.9693 14.225C19.0538 14.2008 19.1021 14.1888 19.1141 14.1888C19.1262 14.1888 19.1624 14.1586 19.2227 14.0983C19.283 14.038 19.3192 14.0138 19.3313 14.0259V4.66941Z" fill="currentColor"/>
            <path d="M26.2627 4.54274C26.9384 3.56546 27.8613 3.07683 29.0316 3.07683C29.6108 3.07683 30.1899 3.23367 30.769 3.54736C31.3481 3.86106 31.8187 4.41605 32.1806 5.21235C32.6271 6.21375 32.8503 7.58918 32.8503 9.33862C32.8503 11.2087 32.5909 12.6384 32.0721 13.6278C31.8308 14.1345 31.499 14.5387 31.0767 14.8403C30.6544 15.1419 30.2864 15.3289 29.9727 15.4013C29.659 15.4737 29.3514 15.516 29.0497 15.528C28.7361 15.528 28.4224 15.4918 28.1087 15.4194C27.795 15.347 27.427 15.154 27.0047 14.8403C26.5824 14.5266 26.2506 14.1224 26.0093 13.6278C25.4905 12.6384 25.2311 11.2087 25.2311 9.33862C25.2311 7.23929 25.575 5.64066 26.2627 4.54274ZM30.3347 4.32556C29.9727 3.93948 29.5444 3.74644 29.0497 3.74644C28.543 3.74644 28.1087 3.93948 27.7467 4.32556C27.4451 4.63926 27.246 5.0736 27.1495 5.6286C27.053 6.18359 27.0047 7.34184 27.0047 9.10335C27.0047 11.0096 27.053 12.2644 27.1495 12.8677C27.246 13.4709 27.4632 13.9475 27.801 14.2974C28.1388 14.6593 28.5551 14.8403 29.0497 14.8403C29.5324 14.8403 29.9426 14.6593 30.2804 14.2974C30.6303 13.9354 30.8474 13.4287 30.9319 12.7772C31.0164 12.1257 31.0646 10.901 31.0767 9.10335C31.0767 7.35391 31.0284 6.20169 30.9319 5.64669C30.8354 5.0917 30.6363 4.65132 30.3347 4.32556Z" fill="currentColor"/>
            <rect x="34" width="8" height="9" fill="#C4C4C4"/>
            </svg>
        </a>
        <a class="input-widget-button" data-latex-command="\\leq" data-move-cursor="0" title="Less than or equal to">
            <svg xmlns="http://www.w3.org/2000/svg" height="30%" viewBox="0 -636 778 774" xmlns:xlink="http://www.w3.org/1999/xlink" style=""><defs><path id="MJX-145-TEX-N-2264" d="M674 636Q682 636 688 630T694 615T687 601Q686 600 417 472L151 346L399 228Q687 92 691 87Q694 81 694 76Q694 58 676 56H670L382 192Q92 329 90 331Q83 336 83 348Q84 359 96 365Q104 369 382 500T665 634Q669 636 674 636ZM84 -118Q84 -108 99 -98H678Q694 -104 694 -118Q694 -130 679 -138H98Q84 -131 84 -118Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><g data-mml-node="math"><g data-mml-node="mo"><use xlink:href="#MJX-145-TEX-N-2264"></use></g></g></g></svg>
        </a>
        <a class="input-widget-button" data-latex-command="\\geq" data-move-cursor="0" title="Greater than or equal to">
            <svg xmlns="http://www.w3.org/2000/svg" height="30%" viewBox="0 -636 778 774" xmlns:xlink="http://www.w3.org/1999/xlink" style=""><defs><path id="MJX-146-TEX-N-2265" d="M83 616Q83 624 89 630T99 636Q107 636 253 568T543 431T687 361Q694 356 694 346T687 331Q685 329 395 192L107 56H101Q83 58 83 76Q83 77 83 79Q82 86 98 95Q117 105 248 167Q326 204 378 228L626 346L360 472Q291 505 200 548Q112 589 98 597T83 616ZM84 -118Q84 -108 99 -98H678Q694 -104 694 -118Q694 -130 679 -138H98Q84 -131 84 -118Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><g data-mml-node="math"><g data-mml-node="mo"><use xlink:href="#MJX-146-TEX-N-2265"></use></g></g></g></svg>
        </a>
        <a class="input-widget-button" data-latex-command="\\lt" data-move-cursor="0" title="Less than">
            <svg xmlns="http://www.w3.org/2000/svg" height="20%" viewBox="0 -540 778 580" xmlns:xlink="http://www.w3.org/1999/xlink" style=""><defs><path id="MJX-147-TEX-N-3C" d="M694 -11T694 -19T688 -33T678 -40Q671 -40 524 29T234 166L90 235Q83 240 83 250Q83 261 91 266Q664 540 678 540Q681 540 687 534T694 519T687 505Q686 504 417 376L151 250L417 124Q686 -4 687 -5Q694 -11 694 -19Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><g data-mml-node="math"><g data-mml-node="mo"><use xlink:href="#MJX-147-TEX-N-3C"></use></g></g></g></svg>
        </a>
        <a class="input-widget-button" data-latex-command="\\gt" data-move-cursor="0" title="Greater than">
            <svg xmlns="http://www.w3.org/2000/svg" height="20%" viewBox="0 -540 778 580" xmlns:xlink="http://www.w3.org/1999/xlink" style=""><defs><path id="MJX-148-TEX-N-3E" d="M84 520Q84 528 88 533T96 539L99 540Q106 540 253 471T544 334L687 265Q694 260 694 250T687 235Q685 233 395 96L107 -40H101Q83 -38 83 -20Q83 -19 83 -17Q82 -10 98 -1Q117 9 248 71Q326 108 378 132L626 250L378 368Q90 504 86 509Q84 513 84 520Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><g data-mml-node="math"><g data-mml-node="mo"><use xlink:href="#MJX-148-TEX-N-3E"></use></g></g></g></svg>
        </a>
        <a class="input-widget-button" data-latex-command="\\pi" data-move-cursor="0" title="Pi">
            <svg xmlns="http://www.w3.org/2000/svg" height="25%" viewBox="0 -431 570 442" xmlns:xlink="http://www.w3.org/1999/xlink" style=""><defs><path id="MJX-6-TEX-I-3C0" d="M132 -11Q98 -11 98 22V33L111 61Q186 219 220 334L228 358H196Q158 358 142 355T103 336Q92 329 81 318T62 297T53 285Q51 284 38 284Q19 284 19 294Q19 300 38 329T93 391T164 429Q171 431 389 431Q549 431 553 430Q573 423 573 402Q573 371 541 360Q535 358 472 358H408L405 341Q393 269 393 222Q393 170 402 129T421 65T431 37Q431 20 417 5T381 -10Q370 -10 363 -7T347 17T331 77Q330 86 330 121Q330 170 339 226T357 318T367 358H269L268 354Q268 351 249 275T206 114T175 17Q164 -11 132 -11Z"></path></defs><g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><g data-mml-node="math"><g data-mml-node="mi"><use xlink:href="#MJX-6-TEX-I-3C0"></use></g></g></g></svg>
        </a>
    `

    const widgetContainer = document.getElementById(container)

    const MQ = MathQuill.getInterface(2)

    // Create an object to store all of the templates
    const templates = {
        "pi": "\\MathQuillMathField{}\\pi",
        "power": "\\MathQuillMathField{}^{\\MathQuillMathField{}}",
        "fraction": "\\frac{\\MathQuillMathField{}}{\\MathQuillMathField{}}",
        "vector": "\\binom{\\MathQuillMathField{}}{\\MathQuillMathField{}}",
        "coordinate": "\\left(\\MathQuillMathField{},\\MathQuillMathField{}\\right)",
        "sqrt": "\\sqrt{\\MathQuillMathField{}}",
        "repeating": "\\MathQuillMathField{}.\\dot{\\MathQuillMathField{}}",
        "standard": "\\MathQuillMathField{}\\times{10^{\\MathQuillMathField{}}}",
        "leq": "\\MathQuillMathField{}\\le\\MathQuillMathField{}",
        "geq": "\\MathQuillMathField{}\\ge\\MathQuillMathField{}",
        "lt": "\\MathQuillMathField{}\\lt\\MathQuillMathField{}",
        "gt": "\\MathQuillMathField{}\\gt\\MathQuillMathField{}",
    }

    // Switch between light and dark mode
    document.addEventListener('themeset', (event) => {
        // Switch the css class of the widget container when the theme changes
        const newThemeClass = `input-section-container-${event.detail.newTheme}`

        widgetContainer.classList = ""

        widgetContainer.classList.add(newThemeClass)
    })

    // Reflow all of the mathquill elements
    const reflowAllElements = () => {
        Object.entries(fields).forEach(([_, field]) => field.reflow())
    }

    // Create an object store references to all of the input fields on the page
    let fields = {}

    // Create an list to store all of the answers from the math fields
    let answers = []

    // Keep track of which field is focused (equation mode)
    let currentlyFocusedField = null

    // Get the field that is currently being focused
    const currentField = () => {
        if(currentlyFocusedField == null) {
            currentlyFocusedField = Object.entries(fields)[0][0]
        }

        return fields[currentlyFocusedField]
    }

    // Create the equation type of input field
    const createEquationField = () => {
        const wrapper = document.createElement('div')
        wrapper.classList.add("widget-equation-wrapper")

        const inputField = document.createElement('span')

        // Adds a specific equation class (for css)
        inputField.classList.add("widget-equation-input")

        // Insert the input field into the wrapper
        wrapper.append(inputField)

        return {inputField, wrapper}
    }

    // Create a basic labelled field
    const createLabelledField = (label, labelPosition) => {
        // Create the div wrapper that surrounds this labelled field
        const wrapper = document.createElement('div')
        wrapper.classList.add("labelled-input-row")

        // Create the input field
        const inputField = document.createElement('span')
        inputField.classList.add("widget-labelled-input")

        // Create the field label
        const inputLabel = document.createElement('p')
        inputLabel.innerHTML = label
        inputLabel.classList.add("labelled-input-label")

        // Insert the input field and the label into the wrapper div
        if(labelPosition === "left") wrapper.append(inputLabel, inputField)
        else if(labelPosition === "right") wrapper.append(inputField, inputLabel)
        else throw `Error: Label position is invalid for: ${label}`

        return {inputField, wrapper}
    }

    // Create a labelled field with a template
    const createTemplateField = (label, labelPosition, template) => {
        // Create the div wrapper that surrounds this labelled field
        const wrapper = document.createElement('div')
        wrapper.classList.add("labelled-input-row")

        // Create the input field
        const inputField = document.createElement('span')
        inputField.innerHTML = template

        // Create the field label
        const inputLabel = document.createElement('p')
        inputLabel.innerText = label
        inputLabel.classList.add("labelled-input-label")

        // Insert the input field and the label into the wrapper div
        if(labelPosition === "left") wrapper.append(inputLabel, inputField)
        else if(labelPosition === "right") wrapper.append(inputField, inputLabel)
        else console.error(`Error: Label position is invalid for: ${label}`)

        return {inputField, wrapper}
    }

    // Create a normal mathquill math field
    const createMathField = (element, editCallback) => {
        // Creates a new math field at the given element
        const mathField = MQ.MathField(element, {
            spaceBehavesLikeTab: true, // See mathquill docs
            handlers: {
                edit: editCallback
            }
        })

        return mathField
    }

    // Create a fill-in-the-blank math field (template field)
    const createTemplateMathField = (element, editCallback) => {
        // Create a static math area at the given element
        const mathField = MQ.StaticMath(element)

        // Set up each input area within this input field
        mathField.innerFields.forEach((field) => {

            // Set the configuration of this sub-field
            field.config({
                spaceBehavesLikeTab: true, // See mathquill docs
                handlers: {
                    edit: () => editCallback(mathField)
                }
            })
        })

        return mathField
    }

    // Create a hidden input
    const createHiddenInput = ({name, initialValue = ''}) => {
        const hiddenInput = document.createElement('input')

        hiddenInput.type = "hidden"
        hiddenInput.name = name
        hiddenInput.value = initialValue

        return hiddenInput
    }

    const removeSpacesFromString = (string) => {
        let _string = string.slice(0, string.length)

        // Replace "\ "
        _string = _string.replace(/\\\s/g, "")

        // Replace spaces
        _string = _string.replace(/\s/g, "")

        return _string
    }

    // Create an answer container that holds the answer for one math field
    const createAnswerContainer = (answersHiddenInput) => {
        answers.push("")

        const index = answers.length - 1

        const getValue = () => answers[index]

        const setValue = (value) => {
            answers[index] = value
            answersHiddenInput.value = encodeURIComponent(JSON.stringify(answers.map(answer => removeSpacesFromString(answer))))
        }

        return { getValue, setValue }
    }

    // Create all of the input fields for the widget
    const createFields = (() => {
        const answersHiddenInput = createHiddenInput({name: "answers[]"})
        widgetContainer.append(answersHiddenInput)

        switch(inputType) {
            case "equation": {
                // Create the input buttons
                const buttonRow = document.createElement('div')
                buttonRow.className = "input-button-row"
                buttonRow.innerHTML = inputButtons

                // Add the input buttons to the html
                widgetContainer.append(buttonRow)

                const {inputField, wrapper} = createEquationField()
                const answerContainer = createAnswerContainer(answersHiddenInput)

                // Insert the input field and the hidden input into the widget container
                widgetContainer.append(wrapper)

                const inputMathField = createMathField(inputField, (mathField) => { 
                    // Set this (the only field) to be the field currently focused
                    currentlyFocusedField = "0"
                    
                    const previousMath = answerContainer.getValue()
                    const enteredMath = mathField.latex()

                    // Custom to dot, move the cursor to the right if the dot is filled
                    const indicesOfDot = []
                    const regex = /dot/gi

                    let result

                    // Find all occurences of dot in the old latex
                    while((result = regex.exec(previousMath))) {
                        indicesOfDot.push(result.index)
                    }

                    let dotChanged = false

                    for(const index of indicesOfDot) {
                        const emptyIndex = index + 4
                        if(enteredMath[index] == 'd' && enteredMath[emptyIndex] != ' ' && enteredMath[emptyIndex] != previousMath[emptyIndex]) dotChanged = true
                    }
        
                    if(dotChanged) mathField.keystroke("Right")

                    answerContainer.setValue(enteredMath)
                })

                // Add this field to the fields object
                fields["0"] = inputMathField
                
                break
            }
            case "labelled": {
                // Create all of the labelled input fields
                labelledInputs.forEach(({label, labelPosition, template}, i) => {
                    if(template == null) {
                        // Create all of the elements for the labelled field
                        const {inputField, wrapper} = createLabelledField(label, labelPosition)

                        // Insert the input field into the widget container
                        widgetContainer.append(wrapper)

                        const answerContainer = createAnswerContainer(answersHiddenInput)

                        // Create a math field in the input field element provided above
                        const inputMathField = createMathField(inputField, (mathField) => {                         
                            const enteredMath = mathField.latex()
                
                            answerContainer.setValue(enteredMath)
                        })

                        // Add this field to the fields object
                        fields[`${i}`] = inputMathField

                    } else {
                        // Use a predefined template if one is given
                        if(templates.hasOwnProperty(template)) template = templates[template]

                        // Create the elements for the template input field
                        const {inputField, wrapper} = createTemplateField(label, labelPosition, template)

                        // Insert the input field into the widget container
                        widgetContainer.append(wrapper)

                        const answerContainer = createAnswerContainer(answersHiddenInput)

                        // Define the edit callback that will be reused by all of the fill-in-the-blank sub-fields 
                        const editCallback = (mathField) => {
                            const enteredMath = mathField.latex()
                
                            answerContainer.setValue(enteredMath)
                        }

                        // Create the mathquill math field for this labelled input field
                        const inputMathField = createTemplateMathField(inputField, editCallback)

                        // Add this field to the fields object
                        fields[`${i}`] = inputMathField
                    }
                })

                break
            }
            default: {
                console.error(`Error: cannot create an input field of unknown type: ${inputType}`)

                break
            }
        }
    })

    // Make each button add their own latex to 
    // the current input field when they are clicked
    const connectInputButtons = (() => {
        const buttonClass = "input-widget-button"

        // Select all of the math input buttons
        const inputButtons = document.getElementsByClassName(buttonClass)

        for(const button of inputButtons) {
            // Listen for a mousedown event (specific to mathquill buttons)
            button.addEventListener("mousedown", (e) => {
                e.preventDefault()

                // Get the latex from the button's html
                const writeLatex = button.getAttribute("data-latex-write") ?? ""
                const cmdLatex = button.getAttribute("data-latex-command") ?? ""

                // Add the latex to the current input field
                if(writeLatex !== "") currentField().write(writeLatex)
                if(cmdLatex !== "") currentField().cmd(cmdLatex)
                
                currentField().focus()

                const cursorShift = parseInt(button.getAttribute("data-move-cursor")) ?? 0
                
                if(cursorShift === 0) return
                
                for(let i = 0; i < Math.abs(cursorShift); i++) {
                    if(cursorShift > 0) currentField().keystroke("Right")
                    if(cursorShift < 0) currentField().keystroke("Left")
                }
            })
        }
    })

    // They use computed sizes, so tell them to 
    // resize immediately and every time the screen size changes
    const reflowElements = (() => {
        // Call reflow on each field in the fields object
        reflowAllElements()

        // Reflow all of the fields when the page is resized
        window.addEventListener('resize', () => {
            reflowAllElements()
        })
    })

    // Run all of the setup to create the widget
    createFields()
    connectInputButtons()
    reflowElements()
}